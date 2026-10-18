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
import {
  User,
  Mail,
  Phone,
  Building2,
  Shield,
  KeyRound,
  LogOut,
  ShieldCheck,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge } from '../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { useAuth } from '../store/AuthContext';
import { usePartner } from '../store/PartnerContext';

export default function MyProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { currentEstablishment, accessRole } = usePartner();

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
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header title="My Profile" subtitle="Account details & role" showBack backLabel="More" />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.replace(/^dr\.?\s*/i, '').slice(0, 2).toUpperCase() : ''}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name}</Text>
              <Text style={styles.userRole}>{accessRole === 'Owner' ? 'Owner' : accessRole === 'Staff' ? 'Counter staff' : accessRole === 'Doctor' ? 'Doctor' : ''}</Text>
            </View>
            <StatusBadge status="active" label="Active" />
          </View>
        </View>

        {/* Contact Info Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Identity & Contact</Text>

          <View style={styles.infoRow}>
            <Mail size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Official Email</Text>
              <Text style={styles.infoValue}>{user?.email || '—'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Phone size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Registered Mobile Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <ShieldCheck size={18} color={Colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Access Role</Text>
              <Text style={styles.infoValue}>
                {accessRole === 'Owner' ? 'Owner (can manage counter staff)' : accessRole === 'Staff' ? 'Counter staff' : accessRole === 'Doctor' ? 'Doctor (own profile and timing)' : ''}
              </Text>
            </View>
          </View>
        </View>

        {/* Affiliated Establishment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Assigned Facility</Text>

          <View style={styles.facilityBox}>
            <Building2 size={24} color={Colors.primary} />
            <View style={styles.facilityContent}>
              <Text style={styles.facilityName}>
                {currentEstablishment?.name}
              </Text>
              <Text style={styles.facilitySub}>
                {currentEstablishment?.address}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <TouchableOpacity
          style={styles.changePwdBtn}
          onPress={() => router.push('/change-password')}
        >
          <KeyRound size={18} color={Colors.primary} />
          <Text style={styles.changePwdBtnText}>Change Security Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color={Colors.error} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
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
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
    paddingBottom: Spacing.xxxl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.h2,
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
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    fontSize: 11,
  },
  infoValue: {
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 1,
  },
  facilityBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  facilityContent: {
    flex: 1,
  },
  facilityName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  facilitySub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  changePwdBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  changePwdBtnText: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: Colors.errorLight,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  logoutBtnText: {
    ...Typography.labelMd,
    color: Colors.error,
    fontWeight: '700',
  },
});
