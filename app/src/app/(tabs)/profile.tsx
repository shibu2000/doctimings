import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import Constants from 'expo-constants';
import {
  Globe,
  MapPin,
  Bell,
  BellRing,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  Lock,
  Pencil,
  UserRound,
  Sun,
  Moon,
  Trash2,
  ShieldCheck,
  FileText,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { useApp } from '../../store/AppContext';
import { ConfirmationModal, ConfirmationModalProps } from '../../components/common/ConfirmationModal';
import { GlowingIcon } from '../../components/common/GlowingIcon';

type ModalState = Omit<ConfirmationModalProps, 'onCancel'>;

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  highlightValue?: boolean;
  onPress?: () => void;
  trailing?: React.ReactNode;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, value, highlightValue, onPress, trailing }) => {
  const { theme, isDark } = useApp();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
      activeOpacity={0.7}
      disabled={!onPress}
      onPress={onPress}
    >
      <View style={[styles.menuIconCircle, { backgroundColor: isDark ? theme.surfaceVariant : theme.background }]}>
        {icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>{label}</Text>
        {value ? (
          <Text style={[styles.menuValue, { color: highlightValue ? theme.primaryDark : theme.textSecondary }]}>
            {value}
          </Text>
        ) : null}
      </View>
      {trailing ?? <ChevronRight size={18} color={theme.textMuted} />}
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const {
    currentLocation,
    language,
    changeLanguage,
    lastSyncTime,
    refreshSync,
    setThemeMode,
    notificationsEnabled,
    setNotificationsEnabled,
    clearLocalData,
    theme,
    isDark,
    profile,
  } = useApp();

  const [modal, setModal] = useState<ModalState>({ visible: false, title: '', message: '', onConfirm: () => {} });

  const closeModal = () => setModal((prev) => ({ ...prev, visible: false }));

  const showInfo = (title: string, message: string, variant: ModalState['variant'] = 'info') =>
    setModal({ visible: true, title, message, variant, singleAction: true, confirmText: t('common.done'), onConfirm: closeModal });

  const handleSyncData = async () => {
    const online = await refreshSync();
    if (online) await queryClient.invalidateQueries();
    showInfo(t('settings.offlineData'), online ? t('settings.syncedSuccess') : t('settings.syncFailed'), online ? 'success' : 'warning');
  };

  const handleClearData = () =>
    setModal({
      visible: true,
      title: t('settings.clearDataPrompt'),
      message: t('settings.clearDataConfirm'),
      variant: 'danger',
      confirmText: t('settings.clearDataPrompt'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        await clearLocalData();
        showInfo(t('settings.clearDataPrompt'), t('settings.clearDataSuccess'), 'success');
      },
    });

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;
  const initials = profile
    ? profile.name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('')
    : '';
  const formattedPhone = profile?.phone ? `+91 ${profile.phone.slice(0, 5)} ${profile.phone.slice(5)}` : '';

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.surface }]}
      edges={['top']}
    >
      <Header />
      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[
            styles.userCard,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() => router.push('/profile-setup')}
        >
          <GlowingIcon glowColor={theme.glowPrimary} size={54} pulse={!profile}>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.primary },
              ]}
            >
              {profile ? (
                <Text style={[styles.avatarText, { color: theme.textInverse }]}>
                  {initials}
                </Text>
              ) : (
                <UserRound size={22} color={theme.textInverse} />
              )}
            </View>
          </GlowingIcon>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              {profile ? profile.name : t('profile.setupTitle')}
            </Text>
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
              {profile ? formattedPhone || t('profile.deviceOnly') : t('profile.createHint')}
            </Text>
            {profile && formattedPhone ? (
              <View
                style={[
                  styles.verifiedTag,
                  { backgroundColor: theme.primaryLight },
                ]}
              >
                <Lock size={11} color={theme.primaryDark} />
                <Text
                  style={[
                    styles.verifiedTagText,
                    { color: theme.primaryDark },
                  ]}
                >
                  {t('profile.deviceOnly')}
                </Text>
              </View>
            ) : null}
          </View>
          {profile ? (
            <Pencil size={16} color={theme.textMuted} />
          ) : (
            <ChevronRight size={18} color={theme.textMuted} />
          )}
        </TouchableOpacity>

        <View
          style={[
            styles.privacyBanner,
            {
              backgroundColor: isDark
                ? theme.surfaceVariant
                : theme.primaryLight,
            },
          ]}
        >
          <Lock size={18} color={theme.primary} />
          <View style={styles.privacyContent}>
            <Text style={[styles.privacyTitle, { color: theme.primaryDark }]}>
              {t('common.privacyBadge')}
            </Text>
            <Text style={[styles.privacyBody, { color: theme.textSecondary }]}>
              {t('common.privacyDesc')}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.subtitle')}
          </Text>
          <MenuItem
            icon={<Globe size={18} color={theme.primary} />}
            label={t('settings.appLanguage')}
            value={language === 'en' ? 'English (En)' : 'বাংলা (Bangla)'}
            highlightValue
            onPress={() => changeLanguage(language === 'en' ? 'bn' : 'en')}
          />
          <MenuItem
            icon={isDark ? <Sun size={18} color={theme.warning} /> : <Moon size={18} color={theme.primary} />}
            label={t('settings.themeTitle')}
            value={isDark ? t('settings.themeDark') : t('settings.themeLight')}
            highlightValue
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          />
          <MenuItem
            icon={<MapPin size={18} color={theme.primary} />}
            label={t('settings.searchLocation')}
            value={locationName}
            highlightValue
            onPress={() => router.push('/location-select')}
          />
          <MenuItem
            icon={<Bell size={18} color={theme.primary} />}
            label={t('notifications.title')}
            value={t('notifications.subtitle')}
            onPress={() => router.push('/notifications')}
          />
          <MenuItem
            icon={<BellRing size={18} color={theme.primary} />}
            label={t('settings.visitReminders')}
            value={t('settings.visitRemindersDesc')}
            trailing={
              <Switch
                value={notificationsEnabled}
                onValueChange={async (enabled) => {
                  if (!(await setNotificationsEnabled(enabled))) {
                    showInfo(t('reminders.permissionTitle'), t('reminders.permissionDenied'), 'warning');
                  }
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={theme.surface}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.privacySection')}
          </Text>
          <MenuItem
            icon={<RefreshCw size={18} color={theme.primary} />}
            label={t('settings.syncNow')}
            value={t('settings.lastUpdated', { time: lastSyncTime })}
            onPress={handleSyncData}
          />
          <MenuItem
            icon={<Trash2 size={18} color={theme.error} />}
            label={t('settings.dataStorage')}
            value={t('settings.dataStorageDesc')}
            onPress={handleClearData}
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.supportSection')}
          </Text>
          <MenuItem
            icon={<HelpCircle size={18} color={theme.warning} />}
            label={t('report.title')}
            value={t('report.subtitle')}
            onPress={() => router.push('/report')}
          />
          <MenuItem
            icon={<ShieldCheck size={18} color={theme.primary} />}
            label={t('settings.privacyPolicy')}
            value={t('settings.privacyPolicyDesc')}
            onPress={() => showInfo(t('settings.privacyPolicy'), t('settings.privacyPolicyBody'))}
          />
          <MenuItem
            icon={<FileText size={18} color={theme.primary} />}
            label={t('settings.termsOfUse')}
            value={t('settings.termsOfUseDesc')}
            onPress={() => showInfo(t('settings.termsOfUse'), t('settings.termsOfUseBody'))}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            {t('common.appName')} v{Constants.expoConfig?.version}
          </Text>
          <Text style={[styles.footerNote, { color: theme.textMuted }]}>
            {t('common.verifiedDirectory')}
          </Text>
        </View>
      </ScrollView>

      <ConfirmationModal {...modal} onCancel={closeModal} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
  },
  userPhone: {
    fontSize: 13,
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  verifiedTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  privacyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
  },
  privacyContent: {
    flex: 1,
  },
  privacyTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  privacyBody: {
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuValue: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerNote: {
    fontSize: 11,
  },
});
