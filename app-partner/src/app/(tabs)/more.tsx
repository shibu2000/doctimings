import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  KeyRound,
  ShieldCheck,
  DoorOpen,
  Users,
  HeartPulse,
  HelpCircle,
  LogOut,
  ChevronRight,
  Building2,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { usePartner } from '../../store/PartnerContext';

export default function MoreScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentEstablishment, unreadNotificationsCount, isDoctor, canManagePeople, accessRole } = usePartner();
  const roleLabel = accessRole === 'Owner' ? 'Owner' : accessRole === 'Staff' ? 'Counter staff' : accessRole === 'Doctor' ? 'Doctor' : '';

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to end your active partner session?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>More</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* User Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          onPress={() => router.push('/profile')}
          activeOpacity={0.7}
        >
          <View style={styles.profileTopRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.replace(/^dr\.?\s*/i, '').slice(0, 2).toUpperCase() : ''}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{roleLabel}</Text>
            </View>
            <View style={styles.sessionBadge}>
              <View style={styles.activeDot} />
              <Text style={styles.sessionText}>Active Session</Text>
            </View>
          </View>

          {/* Facility context */}
          <View style={styles.facilityBox}>
            <Building2 size={16} color={Colors.primary} />
            <View style={styles.facilityTextContainer}>
              <Text style={styles.facilitySub}>Primary Facility</Text>
              <Text style={styles.facilityTitle}>
                {currentEstablishment?.name} · {currentEstablishment?.subDistrict}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Section: Account */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>ACCOUNT</Text>
          <View style={styles.cardMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/profile')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <User size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Profile</Text>
                  <Text style={styles.menuDesc}>Manage your personal account information</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/notifications')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Bell size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Notifications</Text>
                  <Text style={styles.menuDesc}>View important updates and alerts</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                {unreadNotificationsCount > 0 && (
                  <View style={styles.badgeWarning}>
                    <Text style={styles.badgeWarningText}>{unreadNotificationsCount} Unread</Text>
                  </View>
                )}
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/change-password')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <KeyRound size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Change Password</Text>
                  <Text style={styles.menuDesc}>Update security password</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section: Establishment */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>ESTABLISHMENT</Text>
          <View style={styles.cardMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/updates-verification')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <ShieldCheck size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Updates & Verification</Text>
                  <Text style={styles.menuDesc}>Review quarterly facility confirmation</Text>
                </View>
              </View>
              <View style={styles.menuRight}>
                <View style={styles.badgeInfo}>
                  <Text style={styles.badgeInfoText}>1 Action</Text>
                </View>
                <ChevronRight size={18} color={Colors.textMuted} />
              </View>
            </TouchableOpacity>

            {!isDoctor && (
              <>
            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/practice-locations')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <DoorOpen size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Practice Locations</Text>
                  <Text style={styles.menuDesc}>Consultation chambers and rooms</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
              </>
            )}
            {canManagePeople && (
              <>
                <View style={styles.divider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/team')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <Users size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Counter Team</Text>
                  <Text style={styles.menuDesc}>Manage counter staff & receptionist desks</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Section: Platform & Support */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionHeader}>SUPPORT</Text>
          <View style={styles.cardMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/help-support')}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconBox}>
                  <HelpCircle size={18} color={Colors.primary} />
                </View>
                <View>
                  <Text style={styles.menuTitle}>Help & Support</Text>
                  <Text style={styles.menuDesc}>FAQs, phone helpline & desk support</Text>
                </View>
              </View>
              <ChevronRight size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutBtnText}>Sign Out from Partner Panel</Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h3,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  userRole: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sessionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  sessionText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.successText,
    fontWeight: '700',
  },
  facilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  facilityTextContainer: {
    flex: 1,
  },
  facilitySub: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textMuted,
  },
  facilityTitle: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 1,
  },
  menuSection: {
    gap: Spacing.xs,
  },
  sectionHeader: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
    marginLeft: Spacing.xs,
  },
  cardMenu: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  menuDesc: {
    ...Typography.bodySm,
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  badgeWarning: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeWarningText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.errorText,
    fontWeight: '700',
  },
  badgeInfo: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeInfoText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.warningText,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorLight,
    paddingVertical: Spacing.md,
    borderRadius: Radius.xl,
    marginTop: Spacing.sm,
  },
  logoutBtnText: {
    ...Typography.labelMd,
    color: Colors.error,
    fontWeight: '700',
  },
});
