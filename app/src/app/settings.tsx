import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Globe,
  MapPin,
  RefreshCw,
  ShieldCheck,
  FileText,
  Info,
  ChevronRight,
  WifiOff,
  Bell,
  Database,
  CheckCircle2,
  X,
  Sun,
  Moon,
  Smartphone,
} from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { LanguageCode, ThemeMode } from '../types';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GlowingIcon } from '../components/common/GlowingIcon';

export default function SettingsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentLocation,
    language,
    changeLanguage,
    lastSyncTime,
    refreshSync,
    isOffline,
    setIsOffline,
    notificationsEnabled,
    setNotificationsEnabled,
    themeMode,
    setThemeMode,
    theme,
    isDark,
    visits,
    notifications,
    clearLocalData,
  } = useApp();

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    visible: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'danger' | 'success' | 'warning' | 'info';
    singleAction?: boolean;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
  }>({
    visible: false,
    title: '',
    message: '',
    variant: 'primary',
    onConfirm: () => {},
  });

  const handleSelectLanguage = async (lang: LanguageCode) => {
    await changeLanguage(lang);
    setLanguageModalVisible(false);
  };

  const handleSelectTheme = async (mode: ThemeMode) => {
    await setThemeMode(mode);
    setThemeModalVisible(false);
  };

  const handleSyncData = () => {
    refreshSync();
    setConfirmModal({
      visible: true,
      title: t('settings.offlineData'),
      message: t('settings.syncedSuccess'),
      variant: 'success',
      singleAction: true,
      confirmText: t('common.done'),
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const handleClearData = () => {
    setConfirmModal({
      visible: true,
      title: t('settings.clearDataPrompt'),
      message: t('settings.clearDataConfirm'),
      variant: 'danger',
      singleAction: false,
      confirmText: t('settings.clearDataPrompt'),
      cancelText: t('common.cancel'),
      onConfirm: async () => {
        await clearLocalData();
        setConfirmModal({
          visible: true,
          title: t('settings.title'),
          message: t('settings.clearDataSuccess'),
          variant: 'success',
          singleAction: true,
          confirmText: t('common.done'),
          onConfirm: () => setConfirmModal((prev) => ({ ...prev, visible: false })),
        });
      },
    });
  };

  const showPrivacyInfo = () => {
    setConfirmModal({
      visible: true,
      title: t('settings.privacyPolicy'),
      message:
        'DocTimings operates with zero user accounts and zero cloud tracking. Your profile, planned visits, reminder notifications, and location preferences are stored strictly inside this device’s local sandbox storage.',
      variant: 'info',
      singleAction: true,
      confirmText: t('common.done'),
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const showTermsInfo = () => {
    setConfirmModal({
      visible: true,
      title: t('settings.termsOfUse'),
      message:
        'Chamber visiting schedules and doctors information are verified through community contributions and local pharmacy counters. Always call the counter phone number provided before traveling.',
      variant: 'info',
      singleAction: true,
      confirmText: t('common.done'),
      onConfirm: () => setConfirmModal((prev) => ({ ...prev, visible: false })),
    });
  };

  const locationName = language === 'bn' ? currentLocation.nameBn : currentLocation.name;

  const getThemeLabel = () => {
    if (themeMode === 'light') return t('settings.themeLight');
    if (themeMode === 'dark') return t('settings.themeDark');
    return t('settings.themeSystem');
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.surface }]}
      edges={['top', 'bottom']}
    >
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('settings.title')}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.subHeader,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.subTitle, { color: theme.textPrimary }]}>
            {t('settings.subtitle')}
          </Text>
          <Text style={[styles.subDesc, { color: theme.textSecondary }]}>
            {t('settings.privacyNote')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.title')}
          </Text>

          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setLanguageModalVisible(true)}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Globe size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.appLanguage')}
              </Text>
              <Text style={[styles.itemSubHighlight, { color: theme.primaryDark }]}>
                {language === 'en' ? 'English (En)' : 'বাংলা (Bangla)'}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.languageNotice')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setThemeModalVisible(true)}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              {isDark ? (
                <Moon size={18} color={theme.warning} />
              ) : (
                <Sun size={18} color={theme.primary} />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.themeTitle')}
              </Text>
              <Text style={[styles.itemSubHighlight, { color: theme.primaryDark }]}>
                {getThemeLabel()}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.item,
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
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <MapPin size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.searchLocation')}
              </Text>
              <Text style={[styles.itemSubHighlight, { color: theme.primaryDark }]}>
                {locationName}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.searchLocationDesc')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View
            style={[
              styles.toggleItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Bell size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.visitReminders')}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.visitRemindersDesc')}
              </Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={theme.surface}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.offlineData')}
          </Text>

          <TouchableOpacity
            style={[
              styles.item,
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
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <RefreshCw size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.syncNow')}
              </Text>
              <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                Last synced: {lastSyncTime}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.cacheStatus')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View
            style={[
              styles.toggleItem,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <WifiOff size={18} color={isOffline ? theme.error : theme.textSecondary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {isOffline ? 'Offline Mode Active' : 'Offline Simulation'}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {isOffline
                  ? 'Accessing verified chambers from local offline cache'
                  : 'Live online connectivity'}
              </Text>
            </View>
            <Switch
              value={isOffline}
              onValueChange={setIsOffline}
              trackColor={{ false: theme.border, true: theme.error }}
              thumbColor={theme.surface}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.privacySection')}
          </Text>

          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={showPrivacyInfo}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <ShieldCheck size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.privacyPolicy')}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.privacyPolicyDesc')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleClearData}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Database size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.dataStorage')}
              </Text>
              <Text style={[styles.itemSubHighlight, { color: theme.primaryDark }]}>
                {visits.length} planned visits · {notifications.length} saved alerts
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.dataStorageDesc')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('settings.aboutSection')}
          </Text>

          <TouchableOpacity
            style={[
              styles.item,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={showTermsInfo}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <FileText size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.termsOfUse')}
              </Text>
              <Text style={[styles.itemHelper, { color: theme.textMuted }]}>
                {t('settings.termsOfUseDesc')}
              </Text>
            </View>
            <ChevronRight size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View
            style={[
              styles.versionCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: isDark ? theme.surfaceVariant : theme.background },
              ]}
            >
              <Info size={18} color={theme.primary} />
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemLabel, { color: theme.textPrimary }]}>
                {t('settings.appVersion')}
              </Text>
              <Text style={[styles.itemSub, { color: theme.textSecondary }]}>
                {t('settings.version')}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.accountCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <GlowingIcon glowColor={theme.glowPrimary} size={48} pulse>
            <View
              style={[
                styles.avatarCircle,
                { backgroundColor: theme.primary },
              ]}
            >
              <Text style={styles.avatarText}>SD</Text>
            </View>
          </GlowingIcon>
          <View style={styles.accountInfo}>
            <View style={styles.accountNameRow}>
              <Text style={[styles.accountName, { color: theme.textPrimary }]}>
                Shibu Dhara
              </Text>
              <View
                style={[
                  styles.onlinePill,
                  { backgroundColor: theme.successLight },
                ]}
              >
                <View
                  style={[
                    styles.onlineDot,
                    { backgroundColor: theme.success },
                  ]}
                />
                <Text
                  style={[styles.onlineText, { color: theme.successText }]}
                >
                  Local Device
                </Text>
              </View>
            </View>
            <Text style={[styles.accountSub, { color: theme.textSecondary }]}>
              {t('settings.servingAreas')}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.version, { color: theme.textMuted }]}>
            {t('settings.version')}
          </Text>
          <Text style={[styles.legal, { color: theme.textMuted }]}>
            {t('settings.servingAreas')}
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={languageModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {t('settings.appLanguage')}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {t('settings.languageNotice')}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: theme.background },
                ]}
                activeOpacity={0.7}
                onPress={() => setLanguageModalVisible(false)}
              >
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: language === 'en' ? theme.primaryLight : theme.background,
                    borderColor: language === 'en' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectLanguage('en')}
              >
                <View style={styles.langOptInfo}>
                  <Text style={[styles.langOptTitle, { color: theme.textPrimary }]}>
                    English
                  </Text>
                  <Text style={[styles.langOptDesc, { color: theme.textSecondary }]}>
                    Default interface language
                  </Text>
                </View>
                {language === 'en' ? (
                  <CheckCircle2 size={22} color={theme.primary} />
                ) : (
                  <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: language === 'bn' ? theme.primaryLight : theme.background,
                    borderColor: language === 'bn' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectLanguage('bn')}
              >
                <View style={styles.langOptInfo}>
                  <Text style={[styles.langOptTitle, { color: theme.textPrimary }]}>
                    বাংলা (Bangla)
                  </Text>
                  <Text style={[styles.langOptDesc, { color: theme.textSecondary }]}>
                    সম্পূর্ণ অ্যাপ বাংলায় পরিবর্তন করুন
                  </Text>
                </View>
                {language === 'bn' ? (
                  <CheckCircle2 size={22} color={theme.primary} />
                ) : (
                  <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>
            </View>

            <Text style={[styles.modalFooterNote, { color: theme.textMuted }]}>
              {language === 'bn'
                ? 'সংরক্ষিত কোনো ভিজিট বা রিমাইন্ডার না হারিয়ে তাৎক্ষণিকভাবে পরিবর্তন কার্যকর হয়।'
                : 'Changes take effect immediately without losing saved visits.'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={themeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemeModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setThemeModalVisible(false)}
        >
          <TouchableOpacity
            style={[
              styles.modalContent,
              { backgroundColor: theme.surface },
            ]}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                  {t('settings.themeTitle')}
                </Text>
                <Text style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
                  {getThemeLabel()}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  { backgroundColor: theme.background },
                ]}
                activeOpacity={0.7}
                onPress={() => setThemeModalVisible(false)}
              >
                <X size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalList}>
              <TouchableOpacity
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: themeMode === 'light' ? theme.primaryLight : theme.background,
                    borderColor: themeMode === 'light' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTheme('light')}
              >
                <View style={styles.themeRowLeft}>
                  <Sun size={20} color={theme.primary} />
                  <View style={styles.langOptInfo}>
                    <Text style={[styles.langOptTitle, { color: theme.textPrimary }]}>
                      {t('settings.themeLight')}
                    </Text>
                  </View>
                </View>
                {themeMode === 'light' ? (
                  <CheckCircle2 size={22} color={theme.primary} />
                ) : (
                  <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: themeMode === 'dark' ? theme.primaryLight : theme.background,
                    borderColor: themeMode === 'dark' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTheme('dark')}
              >
                <View style={styles.themeRowLeft}>
                  <Moon size={20} color={theme.warning} />
                  <View style={styles.langOptInfo}>
                    <Text style={[styles.langOptTitle, { color: theme.textPrimary }]}>
                      {t('settings.themeDark')}
                    </Text>
                  </View>
                </View>
                {themeMode === 'dark' ? (
                  <CheckCircle2 size={22} color={theme.primary} />
                ) : (
                  <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.languageOption,
                  {
                    backgroundColor: themeMode === 'system' ? theme.primaryLight : theme.background,
                    borderColor: themeMode === 'system' ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleSelectTheme('system')}
              >
                <View style={styles.themeRowLeft}>
                  <Smartphone size={20} color={theme.info} />
                  <View style={styles.langOptInfo}>
                    <Text style={[styles.langOptTitle, { color: theme.textPrimary }]}>
                      {t('settings.themeSystem')}
                    </Text>
                  </View>
                </View>
                {themeMode === 'system' ? (
                  <CheckCircle2 size={22} color={theme.primary} />
                ) : (
                  <View style={[styles.radioEmpty, { borderColor: theme.border }]} />
                )}
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ConfirmationModal
        visible={confirmModal.visible}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        singleAction={confirmModal.singleAction}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  subDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
    paddingLeft: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  toggleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
  },
  itemSubHighlight: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  itemHelper: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    gap: 12,
  },
  accountCard: {
    marginHorizontal: 16,
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  accountInfo: {
    flex: 1,
  },
  accountNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '700',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '600',
  },
  accountSub: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  version: {
    fontSize: 12,
    fontWeight: '600',
  },
  legal: {
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    gap: 10,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    padding: 14,
    borderRadius: 12,
  },
  themeRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  langOptInfo: {
    flex: 1,
  },
  langOptTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  langOptDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radioEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  modalFooterNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
