import React, { useState, useMemo } from 'react';
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
  Bell,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react-native';
import { ThemeColors } from '../constants/theme';
import { useApp } from '../store/AppContext';
import { AppNotification } from '../types';

export default function NotificationsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    language,
    theme,
  } = useApp();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [activeFilter, setActiveFilter] = useState<'all' | 'visits' | 'changes'>('all');

  const filtered = notifications.filter((item) => {
    if (activeFilter === 'visits') return item.type === 'visit_reminder';
    if (activeFilter === 'changes') return item.type === 'chamber_update';
    return true;
  });

  const handleNotificationPress = async (item: AppNotification) => {
    await markNotificationRead(item.id);
    if (item.targetId && item.targetType === 'doctor') {
      router.push(`/doctor/${item.targetId}`);
    }
  };

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'visit_reminder':
        return <Calendar size={18} color={theme.primary} />;
      case 'chamber_update':
        return <Clock size={18} color={theme.warning} />;
      case 'advisory':
      default:
        return <AlertCircle size={18} color={theme.info} />;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <TouchableOpacity
          style={styles.markReadBtn}
          activeOpacity={0.7}
          onPress={markAllNotificationsRead}
        >
          <Text style={styles.markReadText}>{t('notifications.markAllRead')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.subHeader}>
          <Text style={styles.title}>{t('notifications.subtitle')}</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'all' && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter('all')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'all' && styles.filterChipTextActive,
                ]}
              >
                {t('notifications.filterAll')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'visits' && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter('visits')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'visits' && styles.filterChipTextActive,
                ]}
              >
                {t('notifications.filterVisits')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterChip, activeFilter === 'changes' && styles.filterChipActive]}
              activeOpacity={0.7}
              onPress={() => setActiveFilter('changes')}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === 'changes' && styles.filterChipTextActive,
                ]}
              >
                {t('notifications.filterChanges')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.list}>
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const title = language === 'bn' ? item.titleBn : item.title;
              const message = language === 'bn' ? item.messageBn : item.message;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.card, !item.read && styles.cardUnread]}
                  activeOpacity={0.8}
                  onPress={() => handleNotificationPress(item)}
                >
                  <View style={styles.iconBox}>{getIcon(item.type)}</View>

                  <View style={styles.content}>
                    <View style={styles.cardTop}>
                      <Text style={[styles.cardTitle, !item.read && styles.cardTitleUnread]}>
                        {title}
                      </Text>
                      {!item.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardMessage}>{message}</Text>
                    <Text style={styles.cardTime}>{item.timestamp}</Text>
                  </View>

                  <ChevronRight size={16} color={theme.textMuted} />
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.emptyBox}>
              <Bell size={36} color={theme.textMuted} />
              <Text style={styles.emptyText}>{t('notifications.empty')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ThemeColors) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
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
    color: theme.textPrimary,
  },
  markReadBtn: {
    paddingVertical: 4,
  },
  markReadText: {
    fontSize: 12,
    color: theme.primary,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  subHeader: {
    backgroundColor: theme.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  filterChipText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.primaryDark,
    fontWeight: '700',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
    gap: 12,
  },
  cardUnread: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryMuted,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
    flex: 1,
  },
  cardTitleUnread: {
    fontWeight: '700',
    color: theme.primaryDark,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    marginLeft: 6,
  },
  cardMessage: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 3,
    lineHeight: 16,
  },
  cardTime: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 4,
  },
  emptyBox: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: theme.textMuted,
  },
});
