import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ShieldCheck,
  Globe,
  MapPin,
  Compass,
  Bell,
  Sliders,
  HelpCircle,
  RefreshCw,
  ChevronRight,
  WifiOff,
  Lock,
  Sun,
  Moon,
} from 'lucide-react-native';
import { Header } from '../../components/common/Header';
import { useApp } from '../../store/AppContext';
import { ConfirmationModal } from '../../components/common/ConfirmationModal';
import { GlowingIcon } from '../../components/common/GlowingIcon';

export default function ProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentLocation,
    language,
    changeLanguage,
    searchRadius,
    isOffline,
    setIsOffline,
    lastSyncTime,
    refreshSync,
    themeMode,
    setThemeMode,
    theme,
    isDark,
  } = useApp();

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'danger' | 'success' | 'warning' | 'info';
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'primary',
  });

  const handleToggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    changeLanguage(nextLang);
  };

  const handleToggleTheme = () => {
    const nextMode = isDark ? 'light' : 'dark';
    setThemeMode(nextMode);
  };

  const handleSyncData = () => {
    refreshSync();
    setConfirmModal({
      visible: true,
      title: t('settings.offlineData'),
      message: 'Chamber schedules and doctor listings synced successfully for offline use.',
      variant: 'success',
    });
  };

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

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
        <View
          style={[
            styles.userCard,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <GlowingIcon glowColor={theme.glowPrimary} size={54} pulse>
            <View
              style={[
                styles.avatar,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={[styles.avatarText, { color: theme.textInverse }]}>
                SD
              </Text>
            </View>
          </GlowingIcon>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>
              Shibu Dhara
            </Text>
            <Text style={[styles.userPhone, { color: theme.textSecondary }]}>
              +91 98324 10293
            </Text>
            <View
              style={[
                styles.verifiedTag,
                { backgroundColor: theme.primaryLight },
              ]}
            >
              <ShieldCheck size={11} color={theme.primaryDark} />
              <Text
                style={[
                  styles.verifiedTagText,
                  { color: theme.primaryDark },
                ]}
              >
                Verified Patient Directory User
              </Text>
            </View>
          </View>
        </View>

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

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleToggleLanguage}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Globe size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('settings.appLanguage')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.primaryDark }]}>
                {language === 'en' ? 'English (En)' : 'বাংলা (Bangla)'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleToggleTheme}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              {isDark ? (
                <Sun size={18} color={theme.warning} />
              ) : (
                <Moon size={18} color={theme.primary} />
              )}
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('settings.themeTitle')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.primaryDark }]}>
                {isDark ? t('settings.themeDark') : t('settings.themeLight')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/location-select')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <MapPin size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('settings.searchLocation')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.primaryDark }]}>
                {locationName}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/search')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Compass size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('search.filterDistance')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.primaryDark }]}>
                {searchRadius} km radius
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/notifications')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Bell size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('notifications.title')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {t('notifications.subtitle')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.offlineData')}
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleSyncData}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <RefreshCw size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('settings.syncNow')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                Last updated: {lastSyncTime}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => {
              setIsOffline(!isOffline);
              if (!isOffline) {
                router.push('/offline');
              }
            }}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <WifiOff size={18} color={isOffline ? theme.error : theme.textSecondary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {isOffline ? 'Offline Mode Active' : 'Simulate Offline Mode'}
              </Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {isOffline ? 'Tap to reconnect live updates' : 'Test offline cache discovery'}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Support & Community
          </Text>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/report')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <HelpCircle size={18} color={theme.warning} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('report.title')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                {t('report.subtitle')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.menuItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => router.push('/settings')}
          >
            <View
              style={[
                styles.menuIconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Sliders size={18} color={theme.primary} />
            </View>
            <View style={styles.menuContent}>
              <Text style={[styles.menuLabel, { color: theme.textPrimary }]}>
                {t('settings.title')}
              </Text>
              <Text style={[styles.menuValue, { color: theme.textSecondary }]}>
                All system preferences & about
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            {t('settings.version')}
          </Text>
          <Text style={[styles.footerNote, { color: theme.textMuted }]}>
            {t('common.verifiedDirectory')}
          </Text>
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        singleAction
        confirmText={t('common.done')}
        onConfirm={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
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
