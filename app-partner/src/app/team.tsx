import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import {
  Users,
  ShieldCheck,
  UserPlus,
  Mail,
  Phone,
  User,
  X,
  CheckCircle2,
  Shield,
  Building2,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge } from '../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { usePartner } from '../store/PartnerContext';
import { useAuth } from '../store/AuthContext';
import { TeamMember } from '../types';

export default function TeamScreen() {
  const { currentEstablishment } = usePartner();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: 'TM-01',
      name: user?.name || 'Rakesh Das',
      email: user?.email || 'rakesh@example.com',
      phone: '+91 98765 43210',
      role: 'Establishment Admin',
      status: 'Active',
      isCurrentUser: true,
      lastActive: 'Just now',
    },
    {
      id: 'TM-02',
      name: 'Priya Sen',
      email: 'priya@example.com',
      phone: '+91 94340 88219',
      role: 'Counter Staff',
      status: 'Active',
      lastActive: '15 mins ago',
    },
    {
      id: 'TM-03',
      name: 'Anit Roy',
      email: 'anit@example.com',
      phone: '+91 98322 11094',
      role: 'Counter Staff',
      status: 'Active',
      lastActive: 'Yesterday',
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePhone, setInvitePhone] = useState('+91 ');
  const [inviteRole, setInviteRole] = useState<'Counter Staff' | 'Establishment Admin'>('Counter Staff');

  const handleSendInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) {
      Alert.alert('Required Fields', 'Please enter staff name and email address.');
      return;
    }

    const newMember: TeamMember = {
      id: `TM-${Date.now().toString().slice(-4)}`,
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      phone: invitePhone.trim(),
      role: inviteRole,
      status: 'Active',
      lastActive: 'Invited just now',
    };

    setMembers([...members, newMember]);
    Alert.alert('Invitation Dispatched', `Temporary passcode and panel access instructions sent to ${inviteEmail}.`);
    setIsInviteModalOpen(false);
    setInviteName('');
    setInviteEmail('');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Team"
        subtitle="Counter staff & receptionists"
        showBack
        backLabel="More"
        rightAction={
          <TouchableOpacity
            style={styles.inviteHeaderBtn}
            onPress={() => setIsInviteModalOpen(true)}
          >
            <UserPlus size={16} color="#FFFFFF" />
            <Text style={styles.inviteHeaderBtnText}>Invite</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Establishment Overview Card */}
        <View style={styles.card}>
          <View style={styles.estHeaderRow}>
            <View style={styles.estTag}>
              <Building2 size={14} color={Colors.primary} />
              <Text style={styles.estTagText}>{currentEstablishment?.name || 'Maa Medical Centre'}</Text>
            </View>
            <Text style={styles.membersCountText}>{members.length} Team Members</Text>
          </View>

          {/* Scoped Isolation Notice */}
          <View style={styles.isolationNotice}>
            <ShieldCheck size={18} color={Colors.primary} />
            <Text style={styles.isolationText}>
              Team access is strictly scoped to this establishment only. Staff members cannot view patient clinical health records or access other chambers.
            </Text>
          </View>
        </View>

        {/* Team Members List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>COUNTER TEAM ROSTER</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{members.length}</Text>
          </View>
        </View>

        {members.map((member) => (
          <View key={member.id} style={styles.memberCard}>
            <View style={styles.memberCardTop}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <View style={styles.nameRow}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  {member.isCurrentUser && (
                    <View style={styles.youBadge}>
                      <Text style={styles.youBadgeText}>You</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.memberEmail}>{member.email}</Text>
              </View>
              <StatusBadge status="active" />
            </View>

            <View style={styles.memberFooter}>
              <View style={styles.roleTag}>
                <Shield size={14} color={Colors.primary} />
                <Text style={styles.roleText}>{member.role}</Text>
              </View>
              <Text style={styles.lastActiveText}>Active: {member.lastActive}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Invite Staff Modal */}
      <Modal visible={isInviteModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Counter Staff</Text>
              <TouchableOpacity onPress={() => setIsInviteModalOpen(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Grant front-desk staff access to manage daily visiting rosters, delays, and room occupancy.
            </Text>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Supriya Roy"
              placeholderTextColor={Colors.textMuted}
              value={inviteName}
              onChangeText={setInviteName}
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. supriya@maamedical.org"
              placeholderTextColor={Colors.textMuted}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Mobile Phone</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="+91 98765 00000"
              placeholderTextColor={Colors.textMuted}
              value={invitePhone}
              onChangeText={setInvitePhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Role & Permissions</Text>
            <View style={styles.rolePickerRow}>
              {(['Counter Staff', 'Establishment Admin'] as const).map((r) => (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleChip, inviteRole === r && styles.roleChipSelected]}
                  onPress={() => setInviteRole(r)}
                >
                  <Text
                    style={[styles.roleChipText, inviteRole === r && styles.roleChipTextSelected]}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.sendInviteBtn} onPress={handleSendInvite}>
              <Text style={styles.sendInviteBtnText}>Send Partnership Invitation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  inviteHeaderBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  inviteHeaderBtnText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
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
    gap: Spacing.sm,
  },
  estHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  estTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  estTagText: {
    ...Typography.labelSm,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  membersCountText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  isolationNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    marginTop: 4,
  },
  isolationText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  countBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  memberCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  memberCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...Typography.labelLg,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  memberName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  youBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  youBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  memberEmail: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  memberFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
  },
  lastActiveText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalSub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 46,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  rolePickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  roleChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleChipText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
  },
  roleChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  sendInviteBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  sendInviteBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
