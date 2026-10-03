import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  Bell,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { NotificationItem } from '../types';

export default function NotificationsScreen() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NOTIF-01',
      title: 'Schedule Verification Urgent',
      message: 'Dr. Amit Das weekly slot timing expires in 2 days. Please confirm current visiting hours.',
      type: 'urgent',
      timestamp: '10 mins ago',
      read: false,
      link: '/doctor/schedule/DOC-BWN-101',
    },
    {
      id: 'NOTIF-02',
      title: 'Quarterly Information Review',
      message: 'Your establishment record was last verified 90 days ago. Requires 1-minute confirmation.',
      type: 'warning',
      timestamp: '2 hours ago',
      read: false,
      link: '/updates-verification',
    },
    {
      id: 'NOTIF-03',
      title: 'Chamber Capacity Alert',
      message: 'Dr. Amit Das evening chamber has reached 20 out of 25 booked patient tokens.',
      type: 'info',
      timestamp: 'Yesterday',
      read: true,
      link: '/(tabs)',
    },
    {
      id: 'NOTIF-04',
      title: 'Platform Maintenance Notice',
      message: 'DocTimings partner coordination sync will undergo regular indexing at 02:00 AM IST.',
      type: 'info',
      timestamp: '2 days ago',
      read: true,
    },
  ]);

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Notifications"
        subtitle="Operational & roster alerts"
        showBack
        backLabel="More"
        rightAction={
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markReadText}>Mark read</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {notifications.map((notif) => {
          const isUrgent = notif.type === 'urgent';
          const isWarning = notif.type === 'warning';

          return (
            <TouchableOpacity
              key={notif.id}
              style={[styles.notifCard, !notif.read && styles.notifCardUnread]}
              onPress={() => {
                if (notif.link) router.push(notif.link as any);
              }}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBox,
                  isUrgent && styles.iconBoxUrgent,
                  isWarning && styles.iconBoxWarning,
                ]}
              >
                {isUrgent ? (
                  <AlertTriangle size={18} color={Colors.error} />
                ) : isWarning ? (
                  <Clock size={18} color={Colors.warningText} />
                ) : (
                  <Bell size={18} color={Colors.primary} />
                )}
              </View>

              <View style={styles.notifContent}>
                <View style={styles.titleRow}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  {!notif.read && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.notifMsg}>{notif.message}</Text>
                <Text style={styles.notifTime}>{notif.timestamp}</Text>
              </View>

              {notif.link && <ChevronRight size={18} color={Colors.textMuted} style={styles.arrow} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  scroll: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  markReadText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  notifCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notifCardUnread: {
    backgroundColor: '#FAFDFD',
    borderColor: Colors.primaryLight,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxUrgent: {
    backgroundColor: Colors.errorLight,
  },
  iconBoxWarning: {
    backgroundColor: Colors.warningLight,
  },
  notifContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  notifMsg: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  notifTime: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  arrow: {
    alignSelf: 'center',
  },
});
