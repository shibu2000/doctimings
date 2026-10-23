import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationItem, MyVisit, AppNotification, LanguageCode, ThemeMode, UserProfile, ReminderOutcome } from '../types';
import i18n, { loadStoredLanguage, setAppLanguage } from '../locales/i18n';
import { ThemeColors, getThemeColors } from '../constants/theme';
import { api, onConnectivityChange, Town } from '../services/api';
import { cancelReminders, ensureReminderPermission, scheduleVisitReminders } from '../services/reminders';
import { canDetectWithoutPrompt, CURRENT_LOCATION_ID, detectCoords, locationFromCoords, MEDINIPUR } from '../services/location';

export type LocationStatus = 'detecting' | 'ready' | 'approximate' | 'denied' | 'off';

interface AppContextType {
  isReady: boolean;
  currentLocation: LocationItem;
  setCurrentLocation: (loc: LocationItem) => Promise<void>;
  locationStatus: LocationStatus;
  detectLocation: () => Promise<LocationStatus>;
  towns: Town[];
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  themeMode: ThemeMode;
  isDark: boolean;
  theme: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  profile: UserProfile | null;
  needsProfile: boolean;
  saveProfile: (profile: UserProfile) => Promise<void>;
  skipProfile: () => Promise<void>;
  visits: MyVisit[];
  addVisit: (visit: Omit<MyVisit, 'id' | 'createdAt'>) => Promise<ReminderOutcome>;
  cancelVisit: (id: string) => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<boolean>;
  clearLocalData: () => Promise<void>;
  isOffline: boolean;
  lastSyncTime: string;
  refreshSync: () => Promise<boolean>;
  submitReport: (reportData: {
    doctorId?: string;
    establishmentId?: string;
    issueType: string;
    issueTitle: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    reporterPhone?: string;
  }) => Promise<{ success: boolean; data?: any; error?: string }>;
}

const STORAGE_KEYS = {
  LOCATION: 'user_selected_location',
  TOWNS: 'cached_towns',
  VISITS: 'user_saved_visits',
  NOTIFICATIONS: 'user_notifications',
  NOTIFICATIONS_ENABLED: 'user_notifications_enabled',
  THEME_MODE: 'user_theme_preference',
  PROFILE: 'user_profile',
  PROFILE_PROMPTED: 'user_profile_prompted',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [currentLocation, setCurrentLocationState] = useState<LocationItem>(MEDINIPUR);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('detecting');
  const [towns, setTowns] = useState<Town[]>([]);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [isReady, setIsReady] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [needsProfile, setNeedsProfile] = useState<boolean>(false);
  const [visits, setVisits] = useState<MyVisit[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const isDark = themeMode === 'system' ? systemColorScheme === 'dark' : themeMode === 'dark';
  const theme = getThemeColors(isDark);

  useEffect(() => {
    const initializeState = async () => {
      try {
        const storedLang = await loadStoredLanguage();
        setLanguageState(storedLang as LanguageCode);

        const storedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
        if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system')) {
          setThemeModeState(storedTheme as ThemeMode);
        }


        const [storedProfile, profilePrompted] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE),
          AsyncStorage.getItem(STORAGE_KEYS.PROFILE_PROMPTED),
        ]);
        if (storedProfile) {
          setProfile(JSON.parse(storedProfile));
        } else if (!profilePrompted) {
          setNeedsProfile(true);
        }

        const storedVisits = await AsyncStorage.getItem(STORAGE_KEYS.VISITS);
        if (storedVisits) {
          setVisits(JSON.parse(storedVisits));
        }

        const storedNotifs = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
        if (storedNotifs) {
          setNotifications(JSON.parse(storedNotifs));
        }

        const storedNotifEnabled = await AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
        if (storedNotifEnabled !== null) {
          setNotificationsEnabledState(storedNotifEnabled === 'true');
        }
      } catch {}

      setIsReady(true);
      resolveLocation();
      api.checkHealth();
    };

    initializeState();
  }, []);

  useEffect(
    () =>
      onConnectivityChange((online) => {
        setIsOffline(!online);
        if (online) setLastSyncedAt(Date.now());
      }),
    []
  );

  useEffect(() => {
    if (!isOffline) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') api.checkHealth();
    });
    return () => subscription.remove();
  }, [isOffline]);

  const loadTowns = async (): Promise<{ towns: Town[]; fallback: LocationItem }> => {
    try {
      const result = await api.towns();
      setTowns(result.towns);
      AsyncStorage.setItem(STORAGE_KEYS.TOWNS, JSON.stringify(result)).catch(() => undefined);
      return { towns: result.towns, fallback: { ...result.defaultLocation, nameBn: MEDINIPUR.nameBn, districtBn: MEDINIPUR.districtBn } };
    } catch {
      const cached = await AsyncStorage.getItem(STORAGE_KEYS.TOWNS).catch(() => null);
      const parsed = cached ? (JSON.parse(cached) as { towns: Town[] }) : { towns: [] };
      setTowns(parsed.towns);
      return { towns: parsed.towns, fallback: MEDINIPUR };
    }
  };

  const resolveLocation = async () => {
    setLocationStatus('detecting');
    const saved = await AsyncStorage.getItem(STORAGE_KEYS.LOCATION).catch(() => null);
    const parsed = saved ? (JSON.parse(saved) as LocationItem) : null;
    const manual = parsed && parsed.id !== CURRENT_LOCATION_ID ? parsed : null;
    if (manual) setCurrentLocationState(manual);

    let settled = false;
    const approxPromise = api.approxLocation();
    if (!manual) {
      approxPromise.then((approx) => {
        if (approx && !settled) setCurrentLocationState(approx);
      });
    }

    const [{ towns: list, fallback }, position] = await Promise.all([loadTowns(), detectCoords()]);
    settled = true;
    if (position.ok) {
      setCurrentLocationState(locationFromCoords(list, position.latitude, position.longitude));
      setLocationStatus('ready');
      return;
    }
    if (manual) {
      setCurrentLocationState(manual);
      setLocationStatus(position.reason);
      return;
    }
    const approx = await approxPromise;
    setCurrentLocationState(approx ?? fallback);
    setLocationStatus(approx ? 'approximate' : position.reason);
  };

  const detectLocation = async (): Promise<LocationStatus> => {
    const position = await detectCoords();
    if (!position.ok) return position.reason;
    const list = towns.length ? towns : (await loadTowns()).towns;
    setCurrentLocationState(locationFromCoords(list, position.latitude, position.longitude));
    setLocationStatus('ready');
    return 'ready';
  };

  useEffect(() => {
    if (locationStatus !== 'denied' && locationStatus !== 'off' && locationStatus !== 'approximate') return;
    const subscription = AppState.addEventListener('change', async (state) => {
      if (state === 'active' && (await canDetectWithoutPrompt())) detectLocation();
    });
    return () => subscription.remove();
  }, [locationStatus, towns]);

  const setCurrentLocation = async (loc: LocationItem) => {
    setCurrentLocationState(loc);
    setLocationStatus('ready');
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
    } catch {}
  };

  const changeLanguage = async (lang: LanguageCode) => {
    setLanguageState(lang);
    await setAppLanguage(lang);
  };

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
    } catch {}
  };

  const saveProfile = async (next: UserProfile) => {
    setProfile(next);
    setNeedsProfile(false);
    try {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.PROFILE, JSON.stringify(next)],
        [STORAGE_KEYS.PROFILE_PROMPTED, 'true'],
      ]);
    } catch {}
  };

  const skipProfile = async () => {
    setNeedsProfile(false);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PROFILE_PROMPTED, 'true');
    } catch {}
  };

  const saveVisits = async (updated: MyVisit[]) => {
    setVisits(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updated));
    } catch {}
  };

  const setNotificationsEnabled = async (enabled: boolean) => {
    if (enabled && !(await ensureReminderPermission())) return false;
    setNotificationsEnabledState(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
    } catch {}
    const updated = await Promise.all(
      visits.map(async (visit) => {
        if (!enabled) {
          await cancelReminders(visit.reminderIds);
          return { ...visit, reminderIds: [] };
        }
        if (visit.status !== 'planned' || !visit.reminderEnabled || visit.reminderIds?.length) return visit;
        return { ...visit, reminderIds: await scheduleVisitReminders(visit) };
      })
    );
    await saveVisits(updated);
    return true;
  };

  const clearLocalData = async () => {
    await Promise.all(visits.map((visit) => cancelReminders(visit.reminderIds)));
    setVisits([]);
    setNotifications([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.VISITS);
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch {}
  };

  const addVisit = async (visitData: Omit<MyVisit, 'id' | 'createdAt'>): Promise<ReminderOutcome> => {
    const newVisit: MyVisit = {
      ...visitData,
      id: `visit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const wantsReminder = notificationsEnabled && newVisit.reminderEnabled;
    const allowed = wantsReminder && (await ensureReminderPermission());
    const reminderIds = allowed ? await scheduleVisitReminders(newVisit) : [];
    await saveVisits([{ ...newVisit, reminderIds }, ...visits]);
    if (!allowed) return 'off';
    return reminderIds.length ? 'scheduled' : 'none';
  };

  const cancelVisit = async (id: string) => {
    const target = visits.find((v) => v.id === id);
    await cancelReminders(target?.reminderIds);
    await saveVisits(visits.map((v) => (v.id === id ? { ...v, status: 'cancelled' as const, reminderIds: [] } : v)));
  };

  const markNotificationRead = async (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
  };

  const markAllNotificationsRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {}
  };

  const refreshSync = () => api.checkHealth();

  const submitReport = async (reportData: {
    doctorId?: string;
    establishmentId?: string;
    issueType: string;
    issueTitle: string;
    description: string;
    severity?: 'low' | 'medium' | 'high';
    reporterPhone?: string;
  }) => {
    return api.submitReport(reportData);
  };

  const lastSyncTime = lastSyncedAt
    ? new Date(lastSyncedAt).toLocaleTimeString(language === 'bn' ? 'bn-IN' : 'en-IN', { hour: 'numeric', minute: '2-digit' })
    : i18n.t('common.notSyncedYet');

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        isReady,
        currentLocation,
        setCurrentLocation,
        locationStatus,
        detectLocation,
        towns,
        language,
        changeLanguage,
        themeMode,
        isDark,
        theme,
        setThemeMode,
        profile,
        needsProfile,
        saveProfile,
        skipProfile,
        visits,
        addVisit,
        cancelVisit,
        notifications,
        unreadNotificationsCount,
        markNotificationRead,
        markAllNotificationsRead,
        notificationsEnabled,
        setNotificationsEnabled,
        clearLocalData,
        isOffline,
        lastSyncTime,
        refreshSync,
        submitReport,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
