import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  Calendar,
  AlertTriangle,
  History,
} from 'lucide-react-native';
import { Header } from '../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge } from '../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../constants/theme';
import { usePartner } from '../store/PartnerContext';

export default function UpdatesVerificationScreen() {
  const { currentEstablishment } = usePartner();
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleConfirmVerification = () => {
    setIsConfirmed(true);
    Alert.alert(
      'Verification Renewed',
      'Thank you! Your establishment information has been re-verified for the next 90 days.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Updates & Verification"
        subtitle="Periodic compliance & audit trail"
        showBack
        backLabel="More"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Main Status Review Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <ShieldCheck size={24} color={isConfirmed ? Colors.success : Colors.warningText} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.cardTitle}>
                {isConfirmed ? 'Information Verified' : 'Quarterly Review Required'}
              </Text>
              <Text style={styles.cardSub}>
                {isConfirmed ? 'Next review due in 90 days' : 'Last verified 90 days ago'}
              </Text>
            </View>
            <StatusBadge status={isConfirmed ? 'verified' : 'scheduled_today'} label={isConfirmed ? 'Verified' : 'Pending'} />
          </View>

          <Text style={styles.reviewDesc}>
            To ensure patients and emergency services reach the correct location, please confirm that your clinic address, reception desk phone, and doctor chambers remain accurate.
          </Text>

          {/* Checklist */}
          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <CheckCircle2 size={16} color={Colors.primary} />
              <Text style={styles.checkText}>
                Facility Name: <Text style={styles.boldText}>{currentEstablishment?.name}</Text>
              </Text>
            </View>

            <View style={styles.checkItem}>
              <CheckCircle2 size={16} color={Colors.primary} />
              <Text style={styles.checkText}>
                Address: <Text style={styles.boldText}>{currentEstablishment?.address}</Text>
              </Text>
            </View>

            <View style={styles.checkItem}>
              <CheckCircle2 size={16} color={Colors.primary} />
              <Text style={styles.checkText}>
                Phone: <Text style={styles.boldText}>{currentEstablishment?.phone || '—'}</Text>
              </Text>
            </View>
          </View>

          {!isConfirmed && (
            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={handleConfirmVerification}
              activeOpacity={0.8}
            >
              <CheckCircle2 size={18} color="#FFFFFF" />
              <Text style={styles.confirmBtnText}>Confirm & Renew 90-Day Verification</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verification History / Audit Trail */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>AUDIT TRAIL & HISTORY</Text>
        </View>

        <View style={styles.auditCard}>
          <View style={styles.auditItem}>
            <View style={styles.auditDot} />
            <View style={styles.auditContent}>
              <Text style={styles.auditTitle}>Doctor Schedule Slot Updated</Text>
              <Text style={styles.auditMeta}>25 Sep 2026 · Updated by Rakesh Das (Admin)</Text>
              <Text style={styles.auditDesc}>Dr. Amit Das added Thursday 5-7 PM visiting slot.</Text>
            </View>
          </View>

          <View style={styles.auditDivider} />

          <View style={styles.auditItem}>
            <View style={styles.auditDot} />
            <View style={styles.auditContent}>
              <Text style={styles.auditTitle}>Quarterly Verification Confirmed</Text>
              <Text style={styles.auditMeta}>15 Jun 2026 · Confirmed by Counter Desk</Text>
              <Text style={styles.auditDesc}>Facility contact and GPS coordinates confirmed.</Text>
            </View>
          </View>

          <View style={styles.auditDivider} />

          <View style={styles.auditItem}>
            <View style={styles.auditDot} />
            <View style={styles.auditContent}>
              <Text style={styles.auditTitle}>Official Onboarding Completed</Text>
              <Text style={styles.auditMeta}>01 Jan 2026 · Verified by DocTimings Compliance</Text>
              <Text style={styles.auditDesc}>Clinical establishment license verified WB-DL-JHR-2021-9981.</Text>
            </View>
          </View>
        </View>
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  cardSub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  reviewDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  checklist: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkText: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
    flex: 1,
  },
  boldText: {
    fontWeight: '700',
  },
  confirmBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  confirmBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sectionHeaderRow: {
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  auditCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  auditItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  auditContent: {
    flex: 1,
  },
  auditTitle: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  auditMeta: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  auditDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  auditDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Colors.border,
    marginLeft: 26,
  },
});
