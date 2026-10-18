import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocationItem, MyVisit, AppNotification, LanguageCode, ThemeMode } from '../types';
import { INITIAL_VISITS, INITIAL_NOTIFICATIONS } from '../data/mockData';
import { loadStoredLanguage, setAppLanguage } from '../locales/i18n';
import { ThemeColors, getThemeColors } from '../constants/theme';
import { api, Town } from '../services/api';
import { detectCoords, locationFromCoords, MEDINIPUR } from '../services/location';

export type LocationStatus = 'detecting' | 'ready' | 'denied' | 'off';

interface AppContextType {
  currentLocation: LocationItem;
  setCurrentLocation: (loc: LocationItem) => Promise<void>;
  locationStatus: LocationStatus;
  detectLocation: () => Promise<LocationStatus>;
  towns: Town[];
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  language: LanguageCode;
  changeLanguage: (lang: LanguageCode) => Promise<void>;
  themeMode: ThemeMode;
  isDark: boolean;
  theme: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  visits: MyVisit[];
  addVisit: (visit: Omit<MyVisit, 'id' | 'createdAt'>) => Promise<void>;
  cancelVisit: (id: string) => Promise<void>;
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => Promise<void>;
  clearLocalData: () => Promise<void>;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  lastSyncTime: string;
  refreshSync: () => void;
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
  RADIUS: 'user_search_radius',
  VISITS: 'user_saved_visits',
  NOTIFICATIONS: 'user_notifications',
  NOTIFICATIONS_ENABLED: 'user_notifications_enabled',
  THEME_MODE: 'user_theme_preference',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [currentLocation, setCurrentLocationState] = useState<LocationItem>(MEDINIPUR);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('detecting');
  const [towns, setTowns] = useState<Town[]>([]);
  const [searchRadius, setSearchRadiusState] = useState<number>(15);
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  const [visits, setVisits] = useState<MyVisit[]>(INITIAL_VISITS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationsEnabled, setNotificationsEnabledState] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

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


        const storedRadius = await AsyncStorage.getItem(STORAGE_KEYS.RADIUS);
        if (storedRadius) {
          setSearchRadiusState(Number(storedRadius));
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

      resolveLocation();

      api.checkHealth().then(healthy => {
        setIsOffline(!healthy);
        setLastSyncTime(healthy ? 'Just now' : 'Offline mode');
      }).catch(() => {
        setIsOffline(true);
        setLastSyncTime('Offline mode');
      });
    };

    initializeState();
  }, []);

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
    const [{ towns: list, fallback }, position, saved] = await Promise.all([
      loadTowns(),
      detectCoords(),
      AsyncStorage.getItem(STORAGE_KEYS.LOCATION).catch(() => null)
    ]);
    if (position.ok) {
      setCurrentLocationState(locationFromCoords(list, position.latitude, position.longitude));
      setLocationStatus('ready');
      return;
    }
    const manual = saved ? (JSON.parse(saved) as LocationItem) : null;
    setCurrentLocationState(manual && manual.id !== 'current-location' ? manual : fallback);
    setLocationStatus(position.reason);
  };

  const detectLocation = async (): Promise<LocationStatus> => {
    const position = await detectCoords();
    if (!position.ok) return position.reason;
    const list = towns.length ? towns : (await loadTowns()).towns;
    setCurrentLocationState(locationFromCoords(list, position.latitude, position.longitude));
    setLocationStatus('ready');
    return 'ready';
  };

  const setCurrentLocation = async (loc: LocationItem) => {
    setCurrentLocationState(loc);
    setLocationStatus('ready');
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(loc));
    } catch {}
  };

  const setSearchRadius = async (radius: number) => {
    setSearchRadiusState(radius);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RADIUS, String(radius));
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

  const setNotificationsEnabled = async (enabled: boolean) => {
    setNotificationsEnabledState(enabled);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS_ENABLED, String(enabled));
    } catch {}
  };

  const clearLocalData = async () => {
    setVisits([]);
    setNotifications([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.VISITS);
      await AsyncStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch {}
  };

  const addVisit = async (visitData: Omit<MyVisit, 'id' | 'createdAt'>) => {
    const newVisit: MyVisit = {
      ...visitData,
      id: `visit-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newVisit, ...visits];
    setVisits(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updated));
    } catch {}
  };

  const cancelVisit = async (id: string) => {
    const updated = visits.map((v) => (v.id === id ? { ...v, status: 'cancelled' as const } : v));
    setVisits(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify(updated));
    } catch {}
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

  const refreshSync = async () => {
    try {
      const healthy = await api.checkHealth();
      setIsOffline(!healthy);
      setLastSyncTime(healthy ? 'Just now' : 'Offline mode');
    } catch {
      setIsOffline(true);
      setLastSyncTime('Offline mode');
    }
  };

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

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentLocation,
        setCurrentLocation,
        locationStatus,
        detectLocation,
        towns,
        searchRadius,
        setSearchRadius,
        language,
        changeLanguage,
        themeMode,
        isDark,
        theme,
        setThemeMode,
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
        setIsOffline,
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
