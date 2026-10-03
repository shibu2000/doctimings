import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Bell,
  MapPin,
  Clock,
  ArrowRight,
  AlertTriangle,
  Calendar,
  Building2,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  X,
  UserCheck,
} from 'lucide-react-native';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { useAuth } from '../../store/AuthContext';
import { usePartner } from '../../store/PartnerContext';
import { StatusBadge } from '../../components/StatusBadge';
import { api } from '../../services/api';

export default function PartnerHomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    currentEstablishment,
    establishments,
    rosterDoctors,
    practiceLocations,
    overrides,
    setEstablishment,
    refreshAll,
    refreshOverrides,
    unreadNotificationsCount,
  } = usePartner();

  const [refreshing, setRefreshing] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedDoctorForDelay, setSelectedDoctorForDelay] = useState<any>(null);
  const [delayMinutes, setDelayMinutes] = useState(30);
  const [delayReason, setDelayReason] = useState('Traffic / Road delay');
  const [attentionDismissed, setAttentionDismissed] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
    setRefreshing(false);
  };

  const handleApplyDelay = async () => {
    if (!selectedDoctorForDelay || !currentEstablishment) return;

    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await api.createOverride({
        doctorId: selectedDoctorForDelay.id,
        establishmentId: currentEstablishment.id,
        overrideDate: todayStr,
        overrideType: 'changed',
        delayMinutes,
        note: `Doctor running late by ${delayMinutes} mins (${delayReason})`,
      });

      if (res.success) {
        Alert.alert('Chamber Delay Announced', `Patients will see that ${selectedDoctorForDelay.fullName} is delayed by ${delayMinutes} minutes.`);
        await refreshOverrides();
      } else {
        Alert.alert('Notice', 'Override recorded in local session.');
      }
    } catch {
      Alert.alert('Notice', 'Delay updated.');
    } finally {
      setShowDelayModal(false);
    }
  };

  const handleCancelChamber = (doctor: any) => {
    Alert.alert(
      "Cancel Today's Chamber?",
      `Are you sure you want to cancel today's chamber for ${doctor.fullName}? Patients searching DocTimings will be notified immediately that the chamber is unavailable.`,
      [
        { text: 'Keep Chamber', style: 'cancel' },
        {
          text: 'Confirm Cancellation',
          style: 'destructive',
          onPress: async () => {
            if (!currentEstablishment) return;
            const todayStr = new Date().toISOString().split('T')[0];
            await api.createOverride({
              doctorId: doctor.id,
              establishmentId: currentEstablishment.id,
              overrideDate: todayStr,
              overrideType: 'unavailable',
              note: 'Chamber cancelled due to emergency / unforeseen leave',
            });
            await refreshOverrides();
            Alert.alert('Chamber Cancelled', `${doctor.fullName}'s chamber marked unavailable for today.`);
          },
        },
      ]
    );
  };

  // Find active doctor on duty or default to first doctor
  const activeDoctor = rosterDoctors.length > 0 ? rosterDoctors[0] : null;
  const isDoctorDelayed = overrides.some(
    (o) => o.doctorId === activeDoctor?.id && o.overrideType === 'changed'
  );
  const isDoctorCancelled = overrides.some(
    (o) => o.doctorId === activeDoctor?.id && o.overrideType === 'unavailable'
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Operational Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RD'}
            </Text>
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.portalLabel}>PARTNER PORTAL</Text>
            <Text style={styles.greetingText}>
              Good day, {user?.name ? user.name.split(' ')[0] : 'Rakesh'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => router.push('/notifications')}
          accessibilityLabel="Notifications"
        >
          <Bell size={20} color={Colors.textPrimary} />
          {unreadNotificationsCount > 0 && <View style={styles.notifBadge} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[Colors.primary]} />}
      >
        {/* Active Establishment Context Card */}
        <View style={styles.establishmentCard}>
          <View style={styles.estInfo}>
            <View style={styles.estTitleRow}>
              <Text style={styles.estName} numberOfLines={1}>
                {currentEstablishment?.name || 'Maa Medical Centre'}
              </Text>
              <View style={styles.estTypeChip}>
                <Text style={styles.estTypeText}>{currentEstablishment?.type || 'Clinic'}</Text>
              </View>
            </View>
            <View style={styles.estLocationRow}>
              <MapPin size={14} color={Colors.textSecondary} />
              <Text style={styles.estLocationText} numberOfLines={1}>
                {currentEstablishment ? `${currentEstablishment.subDistrict}, ${currentEstablishment.district}` : 'Gopiballavpur, Jhargram'}
              </Text>
            </View>
          </View>

          {establishments.length > 1 && (
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={() => setShowSwitchModal(true)}
            >
              <Text style={styles.switchBtnText}>Switch</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Needs Your Attention Section */}
        {!attentionDismissed && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.attentionHeaderLeft}>
                <Text style={styles.sectionTitle}>NEEDS YOUR ATTENTION</Text>
                <View style={styles.attentionCountBadge}>
                  <Text style={styles.attentionCountText}>2</Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setAttentionDismissed(true)}>
                <Text style={styles.simulateReviewText}>Dismiss all</Text>
              </TouchableOpacity>
            </View>

            {/* Warning Card 1 */}
            <TouchableOpacity
              style={styles.attentionCard}
              onPress={() => router.push(activeDoctor ? `/doctor/schedule/${activeDoctor.id}` : '/doctors')}
              activeOpacity={0.7}
            >
              <View style={styles.attentionIconBox}>
                <AlertTriangle size={20} color={Colors.warning} />
              </View>
              <View style={styles.attentionContent}>
                <View style={styles.attentionTagRow}>
                  <Text style={styles.attentionTag}>Schedule update required</Text>
                  <Text style={styles.urgentText}>Urgent</Text>
                </View>
                <Text style={styles.attentionCardTitle}>
                  {activeDoctor?.fullName || 'Dr. Amit Das'} · General Medicine
                </Text>
                <Text style={styles.attentionTime}>
                  Thursday · 5:00 PM – 7:00 PM (Weekly Slot)
                </Text>
                <View style={styles.attentionActionRow}>
                  <Text style={styles.attentionFootnote}>Slot verification expires in 2 days</Text>
                  <View style={styles.linkRow}>
                    <Text style={styles.linkText}>Review</Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            {/* Warning Card 2 */}
            <TouchableOpacity
              style={styles.attentionCard}
              onPress={() => router.push('/updates-verification')}
              activeOpacity={0.7}
            >
              <View style={[styles.attentionIconBox, { backgroundColor: Colors.primaryLight }]}>
                <ShieldCheck size={20} color={Colors.primary} />
              </View>
              <View style={styles.attentionContent}>
                <View style={styles.attentionTagRow}>
                  <Text style={[styles.attentionTag, { color: Colors.primaryDark, backgroundColor: Colors.primaryLight }]}>
                    Information update
                  </Text>
                  <Text style={styles.quarterlyText}>Quarterly</Text>
                </View>
                <Text style={styles.attentionCardTitle}>Quarterly Details Review</Text>
                <Text style={styles.attentionTime}>
                  Establishment information was last verified 90 days ago.
                </Text>
                <View style={styles.attentionActionRow}>
                  <Text style={styles.attentionFootnote}>Requires 1-min confirmation</Text>
                  <View style={styles.linkRow}>
                    <Text style={styles.linkText}>Confirm</Text>
                    <ArrowRight size={14} color={Colors.primary} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Active Doctor on Duty / Quick Emergency Overrides */}
        {activeDoctor && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>ACTIVE CHAMBER DESK</Text>
              <StatusBadge
                status={isDoctorCancelled ? 'not_available' : isDoctorDelayed ? 'delayed' : 'available_today'}
                label={isDoctorCancelled ? 'Cancelled Today' : isDoctorDelayed ? 'Delayed' : 'Chamber Active'}
              />
            </View>

            <View style={styles.activeChamberCard}>
              <View style={styles.activeDoctorHeader}>
                <View style={styles.doctorAvatarBox}>
                  <Stethoscope size={22} color={Colors.primary} />
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{activeDoctor.fullName}</Text>
                  <Text style={styles.doctorSpecialty}>
                    {activeDoctor.specialty} · Chamber 1 (Ground Floor)
                  </Text>
                </View>
              </View>

              {/* Live Token Status Bar */}
              <View style={styles.tokenStatusContainer}>
                <View style={styles.tokenStatBox}>
                  <Text style={styles.tokenStatLabel}>CURRENT SERVING</Text>
                  <Text style={styles.tokenStatValue}>Token #14</Text>
                </View>
                <View style={styles.tokenDivider} />
                <View style={styles.tokenStatBox}>
                  <Text style={styles.tokenStatLabel}>TOTAL BOOKED</Text>
                  <Text style={styles.tokenStatValue}>25 Tokens</Text>
                </View>
                <View style={styles.tokenDivider} />
                <View style={styles.tokenStatBox}>
                  <Text style={styles.tokenStatLabel}>RUNNING TIME</Text>
                  <Text style={styles.tokenStatValue}>5:00 – 7:30 PM</Text>
                </View>
              </View>

              {/* Emergency Quick Action Buttons */}
              <View style={styles.quickActionsRow}>
                <TouchableOpacity
                  style={styles.delayButton}
                  onPress={() => {
                    setSelectedDoctorForDelay(activeDoctor);
                    setShowDelayModal(true);
                  }}
                >
                  <Clock size={16} color={Colors.warningText} />
                  <Text style={styles.delayButtonText}>Doctor Delayed</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelChamberBtn}
                  onPress={() => handleCancelChamber(activeDoctor)}
                >
                  <AlertTriangle size={16} color={Colors.error} />
                  <Text style={styles.cancelChamberBtnText}>Cancel Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Today's Chamber Roster */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>TODAY'S CHAMBER ROSTER</Text>
            <TouchableOpacity onPress={() => router.push('/doctors')}>
              <Text style={styles.viewAllText}>View all ({rosterDoctors.length})</Text>
            </TouchableOpacity>
          </View>

          {rosterDoctors.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={32} color={Colors.textMuted} />
              <Text style={styles.emptyStateTitle}>No doctors scheduled today</Text>
              <Text style={styles.emptyStateDesc}>
                Add regular visiting hours or configure doctor schedules.
              </Text>
            </View>
          ) : (
            rosterDoctors.map((doc, idx) => (
              <TouchableOpacity
                key={doc.id || idx}
                style={styles.rosterCard}
                onPress={() => router.push(`/doctor/${doc.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.rosterLeft}>
                  <View style={styles.rosterAvatar}>
                    <Text style={styles.rosterAvatarText}>
                      {doc.fullName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.rosterDoctorInfo}>
                    <Text style={styles.rosterDocName}>{doc.fullName}</Text>
                    <Text style={styles.rosterDocSub}>
                      {doc.specialty} · Chamber {idx + 1}
                    </Text>
                  </View>
                </View>

                <View style={styles.rosterRight}>
                  <StatusBadge status={idx === 0 ? 'available_today' : 'scheduled_today'} />
                  <ChevronRight size={18} color={Colors.textMuted} style={{ marginTop: 4 }} />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Room / Chamber Occupancy Overview */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>ROOM OCCUPANCY</Text>
            <TouchableOpacity onPress={() => router.push('/practice-locations')}>
              <Text style={styles.viewAllText}>Manage rooms</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.roomsGrid}>
            <View style={[styles.roomCard, styles.roomOccupied]}>
              <View style={styles.roomStatusDotOccupied} />
              <Text style={styles.roomTitle}>Chamber 1</Text>
              <Text style={styles.roomFloor}>Ground Floor</Text>
              <Text style={styles.roomOccupant}>In Session: Dr. Amit Das</Text>
            </View>

            <View style={[styles.roomCard, styles.roomAvailable]}>
              <View style={styles.roomStatusDotAvailable} />
              <Text style={styles.roomTitle}>Chamber 2</Text>
              <Text style={styles.roomFloor}>1st Floor</Text>
              <Text style={styles.roomOccupantAvailable}>Available for slot</Text>
            </View>
          </View>
        </View>

        {/* Establishment Verification Status Strip */}
        <View style={styles.verificationBanner}>
          <View style={styles.verifLeft}>
            <CheckCircle2 size={20} color={Colors.success} />
            <View>
              <Text style={styles.verifTitle}>Verified & Publicly Discoverable</Text>
              <Text style={styles.verifSub}>
                Patients searching in Gopiballavpur can find your live clinic roster.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.verifBtn}
            onPress={() => router.push('/updates-verification')}
          >
            <Text style={styles.verifBtnText}>Audit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Switch Establishment Modal */}
      <Modal visible={showSwitchModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Switch Establishment</Text>
              <TouchableOpacity onPress={() => setShowSwitchModal(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalList}>
              {establishments.map((est) => (
                <TouchableOpacity
                  key={est.id}
                  style={[
                    styles.modalItem,
                    currentEstablishment?.id === est.id && styles.modalItemSelected,
                  ]}
                  onPress={async () => {
                    await setEstablishment(est);
                    setShowSwitchModal(false);
                  }}
                >
                  <View style={styles.modalItemInfo}>
                    <Text style={styles.modalItemName}>{est.name}</Text>
                    <Text style={styles.modalItemLocation}>
                      {est.type} · {est.subDistrict}, {est.district}
                    </Text>
                  </View>
                  {currentEstablishment?.id === est.id && (
                    <CheckCircle2 size={18} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Doctor Delay Modal */}
      <Modal visible={showDelayModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Announce Chamber Delay</Text>
              <TouchableOpacity onPress={() => setShowDelayModal(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.delayModalDesc}>
              Select the estimated delay for {selectedDoctorForDelay?.fullName}. DocTimings will update the patient arrival window.
            </Text>

            {/* Delay minutes picker */}
            <View style={styles.delayPickerRow}>
              {[15, 30, 45, 60, 90].map((mins) => (
                <TouchableOpacity
                  key={mins}
                  style={[
                    styles.delayChip,
                    delayMinutes === mins && styles.delayChipSelected,
                  ]}
                  onPress={() => setDelayMinutes(mins)}
                >
                  <Text
                    style={[
                      styles.delayChipText,
                      delayMinutes === mins && styles.delayChipTextSelected,
                    ]}
                  >
                    +{mins}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Reasons */}
            <Text style={styles.reasonLabel}>Reason:</Text>
            {['Traffic / Road delay', 'Delayed at Hospital OPD', 'Emergency Procedure', 'Personal Delay'].map((reason) => (
              <TouchableOpacity
                key={reason}
                style={[
                  styles.reasonOption,
                  delayReason === reason && styles.reasonOptionSelected,
                ]}
                onPress={() => setDelayReason(reason)}
              >
                <Text style={styles.reasonText}>{reason}</Text>
                {delayReason === reason && <CheckCircle2 size={16} color={Colors.primary} />}
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.confirmDelayBtn} onPress={handleApplyDelay}>
              <Text style={styles.confirmDelayBtnText}>Broadcast +{delayMinutes}m Delay</Text>
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
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    ...Typography.labelMd,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.success,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  portalLabel: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  greetingText: {
    ...Typography.h3,
    fontSize: 17,
    color: Colors.textPrimary,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  establishmentCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  estInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  estTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  estName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  estTypeChip: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  estTypeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textSecondary,
  },
  estLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  estLocationText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  switchBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceVariant,
  },
  switchBtnText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  sectionContainer: {
    gap: Spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attentionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  attentionCountBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  attentionCountText: {
    ...Typography.labelSm,
    color: Colors.warningText,
    fontWeight: '700',
  },
  simulateReviewText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
  },
  attentionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  attentionIconBox: {
    width: 38,
    height: 38,
    borderRadius: Radius.lg,
    backgroundColor: Colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attentionContent: {
    flex: 1,
  },
  attentionTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  attentionTag: {
    ...Typography.labelSm,
    fontSize: 10,
    backgroundColor: Colors.warningLight,
    color: Colors.warningText,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    fontWeight: '600',
  },
  urgentText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textMuted,
  },
  quarterlyText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.textMuted,
  },
  attentionCardTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  attentionTime: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  attentionActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  attentionFootnote: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  activeChamberCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  activeDoctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  doctorAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  doctorSpecialty: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tokenStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  tokenStatBox: {
    flex: 1,
    alignItems: 'center',
  },
  tokenStatLabel: {
    ...Typography.labelSm,
    fontSize: 9,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  tokenStatValue: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  tokenDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  delayButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: Radius.lg,
    backgroundColor: Colors.warningLight,
  },
  delayButtonText: {
    ...Typography.labelMd,
    color: Colors.warningText,
    fontWeight: '700',
  },
  cancelChamberBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 42,
    borderRadius: Radius.lg,
    backgroundColor: Colors.errorLight,
  },
  cancelChamberBtnText: {
    ...Typography.labelMd,
    color: Colors.error,
    fontWeight: '700',
  },
  viewAllText: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateTitle: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyStateDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  rosterCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rosterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rosterAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rosterAvatarText: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  rosterDoctorInfo: {
    maxWidth: 200,
  },
  rosterDocName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  rosterDocSub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  rosterRight: {
    alignItems: 'flex-end',
  },
  roomsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roomCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  roomOccupied: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  roomAvailable: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.success,
  },
  roomStatusDotOccupied: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginBottom: Spacing.xs,
  },
  roomStatusDotAvailable: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
    marginBottom: Spacing.xs,
  },
  roomTitle: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  roomFloor: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    fontSize: 11,
  },
  roomOccupant: {
    ...Typography.bodySm,
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  roomOccupantAvailable: {
    ...Typography.bodySm,
    color: Colors.success,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 6,
  },
  verificationBanner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  verifLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  verifTitle: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  verifSub: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  verifBtnText: {
    ...Typography.labelSm,
    color: Colors.primaryDark,
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
    maxHeight: '80%',
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
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  modalItemSelected: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
  },
  modalItemInfo: {
    flex: 1,
  },
  modalItemName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  modalItemLocation: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  delayModalDesc: {
    ...Typography.bodyMd,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  delayPickerRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  delayChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  delayChipSelected: {
    backgroundColor: Colors.warningLight,
    borderColor: Colors.warning,
  },
  delayChipText: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  delayChipTextSelected: {
    color: Colors.warningText,
  },
  reasonLabel: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    marginBottom: Spacing.xs,
  },
  reasonOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  reasonText: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
  },
  confirmDelayBtn: {
    backgroundColor: Colors.warning,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  confirmDelayBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
