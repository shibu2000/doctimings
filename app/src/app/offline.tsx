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
  ArrowLeft,
  WifiOff,
  RefreshCw,
  FolderCheck,
  ShieldCheck,
} from 'lucide-react-native';
import { useApp } from '../store/AppContext';
import { DoctorCard } from '../components/common/DoctorCard';
import { DOCTORS } from '../data/mockData';
import { ConfirmationModal } from '../components/common/ConfirmationModal';
import { GlowingIcon } from '../components/common/GlowingIcon';

export default function OfflineScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { lastSyncTime, refreshSync, setIsOffline, theme, isDark } = useApp();
  const [reconnectModalVisible, setReconnectModalVisible] = useState(false);

  const handleReconnect = () => {
    refreshSync();
    setIsOffline(false);
    setReconnectModalVisible(true);
  };

  const handleModalDone = () => {
    setReconnectModalVisible(false);
    router.back();
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
          {t('offline.badge')}
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
            styles.banner,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
            },
          ]}
        >
          <GlowingIcon glowColor={theme.error} size={64} pulse>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.errorLight },
              ]}
            >
              <WifiOff size={28} color={theme.error} />
            </View>
          </GlowingIcon>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {t('offline.title')}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {t('offline.subtitle')}
          </Text>

          <View
            style={[
              styles.syncBadge,
              { backgroundColor: theme.primaryLight },
            ]}
          >
            <FolderCheck size={13} color={theme.primaryDark} />
            <Text
              style={[styles.syncText, { color: theme.primaryDark }]}
            >
              {t('offline.syncedAgo', { time: lastSyncTime })}
            </Text>
          </View>

          <Text
            style={[styles.explanation, { color: theme.textSecondary }]}
          >
            {t('offline.explanation')}
          </Text>

          <TouchableOpacity
            style={[
              styles.reconnectBtn,
              { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.8}
            onPress={handleReconnect}
          >
            <RefreshCw size={15} color={theme.textInverse} />
            <Text
              style={[
                styles.reconnectBtnText,
                { color: theme.textInverse },
              ]}
            >
              {t('offline.tryReconnect')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cachedSection}>
          <View style={styles.cachedHeader}>
            <ShieldCheck size={16} color={theme.primary} />
            <Text
              style={[styles.cachedTitle, { color: theme.textPrimary }]}
            >
              Available in Phone Cache
            </Text>
          </View>

          {DOCTORS.slice(0, 3).map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </View>
      </ScrollView>

      <ConfirmationModal
        visible={reconnectModalVisible}
        title="Reconnected"
        message="Live directory updates and search connectivity resumed."
        variant="success"
        singleAction
        confirmText={t('common.done')}
        onConfirm={handleModalDone}
        onCancel={handleModalDone}
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
  banner: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  syncText: {
    fontSize: 11,
    fontWeight: '600',
  },
  explanation: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 18,
    maxWidth: 320,
  },
  reconnectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  reconnectBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  cachedSection: {
    padding: 16,
  },
  cachedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cachedTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
});
