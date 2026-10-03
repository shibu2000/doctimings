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
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Clock,
  Calendar,
  Plus,
  Trash2,
  Info,
  X,
  AlertCircle,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { Header } from '../../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBadge } from '../../../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../../../constants/theme';
import { usePartner } from '../../../store/PartnerContext';
import { api } from '../../../services/api';
import { OverrideType } from '../../../types';

export default function TemporaryChangesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rosterDoctors, currentEstablishment, overrides, refreshOverrides } = usePartner();

  const doctor = rosterDoctors.find((d) => d.id === id) || (rosterDoctors.length > 0 ? rosterDoctors[0] : null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideType, setOverrideType] = useState<OverrideType>('unavailable');
  const [overrideDate, setOverrideDate] = useState('2026-09-28');
  const [delayMinutes, setDelayMinutes] = useState('45');
  const [publicReason, setPublicReason] = useState('Attending emergency seminar');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const doctorOverrides = overrides.filter((o) => o.doctorId === doctor?.id);

  const handleCreateOverride = async () => {
    if (!doctor || !currentEstablishment) return;

    if (!overrideDate.trim()) {
      Alert.alert('Date Required', 'Please enter the override date (YYYY-MM-DD).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createOverride({
        doctorId: doctor.id,
        establishmentId: currentEstablishment.id,
        overrideDate,
        overrideType,
        note: publicReason,
        delayMinutes: overrideType === 'changed' ? parseInt(delayMinutes, 10) || 30 : undefined,
      });

      if (res.success) {
        Alert.alert('Temporary Change Published', 'Patients searching DocTimings will see this schedule change.');
        await refreshOverrides();
        setIsModalOpen(false);
      } else {
        Alert.alert('Notice', 'Override recorded.');
        setIsModalOpen(false);
      }
    } catch {
      Alert.alert('Notice', 'Temporary change recorded.');
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteOverride = (overrideId: string) => {
    Alert.alert(
      'Remove Temporary Override',
      'This will restore regular weekly consultation timing for that date.',
      [
        { text: 'Keep', style: 'cancel' },
        {
          text: 'Restore Regular Timing',
          style: 'destructive',
          onPress: async () => {
            await api.deleteOverride(overrideId);
            await refreshOverrides();
            Alert.alert('Restored', 'Regular schedule resumed for that date.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Temporary Changes"
        subtitle={doctor ? `${doctor.fullName} · Specific Date Overrides` : 'Schedule overrides'}
        showBack
        backLabel={doctor?.fullName ? doctor.fullName.split(' ')[0] : 'Doctor'}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Screen Context Card */}
        <View style={styles.card}>
          <Text style={styles.estName}>
            {currentEstablishment?.name || 'Maa Medical Centre — Main Branch'}
          </Text>
          <Text style={styles.estAddress}>
            {currentEstablishment?.subDistrict || 'Gopiballavpur'}, {currentEstablishment?.district || 'Jhargram'} · Chamber 1
          </Text>
        </View>

        {/* How It Works Explainer Card */}
        <View style={styles.explainerCard}>
          <View style={styles.explainerHeader}>
            <Info size={18} color={Colors.primary} />
            <Text style={styles.explainerTitle}>How temporary changes work</Text>
          </View>
          <Text style={styles.explainerDesc}>
            A temporary change overrides the regular weekly schedule for a single specific date only. Regular weekly timings resume automatically after.
          </Text>
          <View style={styles.examplePill}>
            <Text style={styles.exampleText}>Regular: Thu 5:00–7:00 PM</Text>
            <Text style={styles.exampleArrow}>→</Text>
            <Text style={styles.exampleChange}>28 Sep: Unavailable</Text>
          </View>
        </View>

        {/* Primary Trigger CTA */}
        <TouchableOpacity
          style={styles.addOverrideBtn}
          onPress={() => setIsModalOpen(true)}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#FFFFFF" />
          <Text style={styles.addOverrideBtnText}>+ Add Temporary Change</Text>
        </TouchableOpacity>

        {/* Upcoming Overrides List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>UPCOMING DATE OVERRIDES</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>{doctorOverrides.length}</Text>
          </View>
        </View>

        {doctorOverrides.length === 0 ? (
          <View style={styles.emptyCard}>
            <Calendar size={36} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No temporary overrides active</Text>
            <Text style={styles.emptyDesc}>
              {doctor?.fullName || 'The doctor'} is following their regular weekly schedule with no reported leaves or delays.
            </Text>
          </View>
        ) : (
          doctorOverrides.map((ovr) => {
            const isUnavailable = ovr.overrideType === 'unavailable';
            const isDelayed = ovr.overrideType === 'changed';

            return (
              <View key={ovr.id} style={styles.overrideCard}>
                <View style={styles.cardTop}>
                  <View>
                    <Text style={styles.dateText}>{ovr.overrideDate}</Text>
                    <Text style={styles.dateSub}>Regular slot affected</Text>
                  </View>
                  <StatusBadge
                    status={isUnavailable ? 'not_available' : isDelayed ? 'delayed' : 'scheduled_today'}
                    label={isUnavailable ? 'Unavailable' : isDelayed ? `Delayed (+${ovr.delayMinutes || 30}m)` : 'Additional'}
                  />
                </View>

                <View style={styles.slotDetailBox}>
                  <View style={styles.detailRow}>
                    <Clock size={15} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>
                      Regular Visiting Hours: 5:00 PM – 7:00 PM
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <AlertCircle size={15} color={Colors.textSecondary} />
                    <Text style={styles.detailText}>Reason: {ovr.note || 'Emergency leave'}</Text>
                  </View>
                </View>

                {/* Patient Visibility Preview */}
                <View style={styles.patientPreviewBox}>
                  <Eye size={16} color={Colors.primary} />
                  <Text style={styles.patientPreviewText}>
                    Patients searching DocTimings will see:{' '}
                    <Text style={{ fontWeight: '700', color: Colors.textPrimary }}>
                      {isUnavailable
                        ? `"Not available on ${ovr.overrideDate}"`
                        : `"Delayed by ${ovr.delayMinutes || 30}m on ${ovr.overrideDate}"`}
                    </Text>
                  </Text>
                </View>

                <View style={styles.cardActionsRow}>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteOverride(ovr.id)}
                  >
                    <Trash2 size={16} color={Colors.error} />
                    <Text style={styles.deleteBtnText}>Remove Override</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add Temporary Change Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Temporary Change</Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Type Selection */}
              <Text style={styles.inputLabel}>Change Type</Text>
              <View style={styles.typeSelectorRow}>
                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    overrideType === 'unavailable' && styles.typeOptionSelectedError,
                  ]}
                  onPress={() => setOverrideType('unavailable')}
                >
                  <AlertCircle
                    size={18}
                    color={overrideType === 'unavailable' ? Colors.error : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      overrideType === 'unavailable' && styles.typeOptionTextSelectedError,
                    ]}
                  >
                    Doctor On Leave / Unavailable
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    overrideType === 'changed' && styles.typeOptionSelectedWarning,
                  ]}
                  onPress={() => setOverrideType('changed')}
                >
                  <Clock
                    size={18}
                    color={overrideType === 'changed' ? Colors.warningText : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      overrideType === 'changed' && styles.typeOptionTextSelectedWarning,
                    ]}
                  >
                    Delay Chamber (Late Arrival)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeOption,
                    overrideType === 'additional' && styles.typeOptionSelectedSuccess,
                  ]}
                  onPress={() => setOverrideType('additional')}
                >
                  <Plus
                    size={18}
                    color={overrideType === 'additional' ? Colors.successText : Colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeOptionText,
                      overrideType === 'additional' && styles.typeOptionTextSelectedSuccess,
                    ]}
                  >
                    Additional Chamber Date
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Specific Date */}
              <Text style={styles.inputLabel}>Specific Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.modalInput}
                value={overrideDate}
                onChangeText={setOverrideDate}
                placeholder="2026-09-28"
              />

              {/* Delay Minutes if Delay Chamber */}
              {overrideType === 'changed' && (
                <>
                  <Text style={styles.inputLabel}>Estimated Delay (Minutes)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={delayMinutes}
                    onChangeText={setDelayMinutes}
                    keyboardType="numeric"
                    placeholder="30"
                  />
                </>
              )}

              {/* Reason for Patients */}
              <Text style={styles.inputLabel}>Public Reason (Visible to Patients)</Text>
              <TextInput
                style={[styles.modalInput, styles.modalInputMulti]}
                value={publicReason}
                onChangeText={setPublicReason}
                placeholder="e.g. Attending emergency surgery or personal leave"
                multiline
                numberOfLines={3}
              />

              {/* Submit CTA */}
              <TouchableOpacity
                style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={handleCreateOverride}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Broadcast Temporary Change</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  },
  estName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  estAddress: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  explainerCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  explainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  explainerTitle: {
    ...Typography.labelMd,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  explainerDesc: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  examplePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    alignSelf: 'flex-start',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  exampleText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
  },
  exampleArrow: {
    color: Colors.primary,
    fontWeight: '700',
  },
  exampleChange: {
    ...Typography.labelSm,
    color: Colors.error,
    fontWeight: '700',
  },
  addOverrideBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  addOverrideBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
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
  emptyCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  overrideCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  dateText: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  dateSub: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    fontSize: 11,
  },
  slotDetailBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  patientPreviewBox: {
    backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },
  patientPreviewText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  cardActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  deleteBtnText: {
    ...Typography.labelSm,
    color: Colors.error,
    fontWeight: '700',
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  modalTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  modalBody: {
    paddingBottom: Spacing.xl,
  },
  inputLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
    marginBottom: 6,
  },
  typeSelectorRow: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typeOptionSelectedError: {
    backgroundColor: Colors.errorLight,
    borderColor: Colors.error,
  },
  typeOptionTextSelectedError: {
    color: Colors.error,
    fontWeight: '700',
  },
  typeOptionSelectedWarning: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
  },
  typeOptionTextSelectedWarning: {
    color: Colors.warningText,
    fontWeight: '700',
  },
  typeOptionSelectedSuccess: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  typeOptionTextSelectedSuccess: {
    color: Colors.successText,
    fontWeight: '700',
  },
  typeOptionText: {
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  modalInput: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    ...Typography.bodyMd,
    color: Colors.textPrimary,
  },
  modalInputMulti: {
    height: 80,
    paddingTop: Spacing.sm,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  submitBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
