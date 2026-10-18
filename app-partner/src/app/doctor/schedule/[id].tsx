import React, { useState, useEffect } from 'react';
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
  Edit2,
  Building2,
  DoorOpen,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react-native';
import { Header } from '../../../components/Header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, Typography, Radius } from '../../../constants/theme';
import { usePartner } from '../../../store/PartnerContext';
import { api } from '../../../services/api';
import { DoctorScheduleSlot, DayOfWeek } from '../../../types';

const DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export default function DoctorScheduleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rosterDoctors, currentEstablishment, practiceLocations } = usePartner();

  const doctor = rosterDoctors.find((d) => d.id === id) || (rosterDoctors.length > 0 ? rosterDoctors[0] : null);

  const [schedules, setSchedules] = useState<DoctorScheduleSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for adding/editing slot
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Thursday');
  const [shiftName, setShiftName] = useState('Evening Consultation');
  const [startTime, setStartTime] = useState('17:00');
  const [endTime, setEndTime] = useState('19:00');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [maxTokens, setMaxTokens] = useState('25');
  const [fee, setFee] = useState('300');
  const [isSaving, setIsSaving] = useState(false);

  const loadSchedules = async () => {
    if (!doctor || !currentEstablishment) return;
    setIsLoading(true);
    try {
      const res = await api.getSchedules({
        doctorId: doctor.id,
        establishmentId: currentEstablishment.id,
      });
      if (res.success && res.data) {
        setSchedules(res.data);
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
    if (practiceLocations.length > 0) {
      setSelectedRoomId(practiceLocations[0].id);
    }
  }, [doctor, currentEstablishment]);

  const handleOpenAddSlot = () => {
    setEditingSlotId(null);
    setSelectedDay('Thursday');
    setShiftName('Evening Consultation');
    setStartTime('17:00');
    setEndTime('19:00');
    setMaxTokens('25');
    setFee('300');
    setIsModalOpen(true);
  };

  const handleOpenEditSlot = (slot: DoctorScheduleSlot) => {
    setEditingSlotId(slot.id);
    setSelectedDay(slot.dayOfWeek);
    setShiftName(slot.shiftName);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
    setSelectedRoomId(slot.practiceLocationId || (practiceLocations[0]?.id || ''));
    setMaxTokens(String(slot.maxTokens || 25));
    setFee(String(slot.consultationFee || 300));
    setIsModalOpen(true);
  };

  const handleSaveSlot = async () => {
    if (!doctor || !currentEstablishment) return;

    setIsSaving(true);
    try {
      const room = practiceLocations.find((l) => l.id === selectedRoomId);
      const roomNumber = room?.roomDesignation || room?.name || 'Chamber 1';

      if (editingSlotId) {
        const res = await api.updateSchedule(editingSlotId, {
          dayOfWeek: selectedDay,
          shiftName,
          startTime,
          endTime,
          roomNumber,
          maxTokens: parseInt(maxTokens, 10) || 25,
          consultationFee: parseInt(fee, 10) || 300,
          practiceLocationId: selectedRoomId,
        });
        if (!res.success) {
          Alert.alert('Not saved', res.error?.message || 'Please try again.');
          return;
        }
        Alert.alert('Slot Updated', 'Weekly consultation timing successfully updated.');
      } else {
        const res = await api.createSchedule({
          doctorId: doctor.id,
          establishmentId: currentEstablishment.id,
          dayOfWeek: selectedDay,
          shiftName,
          startTime,
          endTime,
          roomNumber,
          maxTokens: parseInt(maxTokens, 10) || 25,
          consultationFee: parseInt(fee, 10) || 300,
          practiceLocationId: selectedRoomId,
        });
        if (!res.success) {
          Alert.alert('Not saved', res.error?.message || 'Please try again.');
          return;
        }
        Alert.alert('Slot Added', 'New weekly consultation slot active.');
      }
      setIsModalOpen(false);
      await loadSchedules();
    } catch {
      Alert.alert('Not saved', 'No internet connection. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSlot = (slotId: string) => {
    Alert.alert(
      'Remove Slot',
      'Are you sure you want to remove this recurring schedule slot? Regular patients will no longer see this visiting time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const res = await api.deleteSchedule(slotId);
            if (!res.success) {
              Alert.alert('Not saved', res.error?.message || 'Please try again.');
              return;
            }
            await loadSchedules();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title="Doctor Schedule"
        subtitle={doctor ? `${doctor.fullName} · ${doctor.specialty}` : 'Weekly visiting hours'}
        showBack
        backLabel={doctor?.fullName ? doctor.fullName.split(' ')[0] : 'Doctor'}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Practice Location Context */}
        <View style={styles.card}>
          <View style={styles.locationHeader}>
            <Building2 size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Practice Location</Text>
          </View>
          <View style={styles.locationBox}>
            <Text style={styles.estName}>{currentEstablishment?.name}</Text>
            <Text style={styles.estSub}>
              {currentEstablishment?.address}
            </Text>
            <Text style={styles.locationNote}>
              Weekly schedules configured here apply specifically to this physical counter branch.
            </Text>
          </View>
        </View>

        {/* Temporary Changes Notice */}
        <TouchableOpacity
          style={styles.overridesNoticeCard}
          onPress={() => router.push(doctor ? `/doctor/overrides/${doctor.id}` : '/doctors')}
          activeOpacity={0.7}
        >
          <View style={styles.noticeIconBox}>
            <AlertTriangle size={18} color={Colors.warningText} />
          </View>
          <View style={styles.noticeTextContainer}>
            <Text style={styles.noticeTitle}>Managing a specific holiday or leave?</Text>
            <Text style={styles.noticeDesc}>
              Do not delete the regular schedule. Use Temporary Changes to mark single-date leaves or delays.
            </Text>
          </View>
        </TouchableOpacity>

        {/* Weekly Recurring Slots Header */}
        <View style={styles.slotsSection}>
          <View style={styles.slotsSectionHeader}>
            <Text style={styles.sectionTitle}>RECURRING WEEKLY SLOTS</Text>
            <TouchableOpacity style={styles.addSlotBtn} onPress={handleOpenAddSlot}>
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addSlotBtnText}>Add Slot</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : schedules.length === 0 ? (
            <View style={styles.emptyCard}>
              <Calendar size={36} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No slots configured yet</Text>
              <Text style={styles.emptyDesc}>
                Set regular weekly visiting hours for {doctor?.fullName || 'the doctor'}.
              </Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={handleOpenAddSlot}>
                <Plus size={16} color="#FFFFFF" />
                <Text style={styles.emptyBtnText}>Add First Slot</Text>
              </TouchableOpacity>
            </View>
          ) : (
            schedules.map((slot) => {
              const assignedRoom = practiceLocations.find((l) => l.id === slot.practiceLocationId);
              return (
                <View key={slot.id} style={styles.slotCard}>
                  <View style={styles.slotHeader}>
                    <View style={styles.dayBadge}>
                      <Text style={styles.dayBadgeText}>{slot.dayOfWeek}</Text>
                    </View>
                    <View style={styles.slotActions}>
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => handleOpenEditSlot(slot)}
                      >
                        <Edit2 size={16} color={Colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIconBtn}
                        onPress={() => handleDeleteSlot(slot.id)}
                      >
                        <Trash2 size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={styles.slotShiftName}>{slot.shiftName}</Text>

                  <View style={styles.slotInfoRow}>
                    <Clock size={16} color={Colors.primary} />
                    <Text style={styles.slotTimeText}>
                      {slot.startTime} – {slot.endTime}
                    </Text>
                  </View>

                  <View style={styles.slotInfoRow}>
                    <DoorOpen size={16} color={Colors.textSecondary} />
                    <Text style={styles.slotRoomText}>
                      {assignedRoom ? assignedRoom.roomDesignation : 'Chamber 1 · Ground Floor'}
                    </Text>
                  </View>

                  <View style={styles.slotFooter}>
                    <Text style={styles.slotMetaText}>Max Tokens: {slot.maxTokens || 25}</Text>
                    <Text style={styles.slotMetaText}>
                      Consultation Fee: ₹{slot.consultationFee || 300}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Add / Edit Slot Modal */}
      <Modal visible={isModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingSlotId ? 'Edit Schedule Slot' : 'Add Weekly Slot'}
              </Text>
              <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                <X size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Day Selection */}
              <Text style={styles.inputLabel}>Day of Week</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.dayChipsRow}
              >
                {DAYS.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayChip,
                      selectedDay === day && styles.dayChipSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        selectedDay === day && styles.dayChipTextSelected,
                      ]}
                    >
                      {day.slice(0, 3)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Shift Name */}
              <Text style={styles.inputLabel}>Shift Name / Description</Text>
              <TextInput
                style={styles.modalInput}
                value={shiftName}
                onChangeText={setShiftName}
                placeholder="e.g. Evening Consultation"
                placeholderTextColor={Colors.textMuted}
              />

              {/* Timing */}
              <View style={styles.timeInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Start Time (24h or AM/PM)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={startTime}
                    onChangeText={setStartTime}
                    placeholder="17:00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>End Time</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={endTime}
                    onChangeText={setEndTime}
                    placeholder="19:00"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              {/* Chamber Room Picker */}
              <Text style={styles.inputLabel}>Chamber Room</Text>
              {practiceLocations.map((room) => (
                <TouchableOpacity
                  key={room.id}
                  style={[
                    styles.roomOption,
                    selectedRoomId === room.id && styles.roomOptionSelected,
                  ]}
                  onPress={() => setSelectedRoomId(room.id)}
                >
                  <Text style={styles.roomOptionText}>{room.roomDesignation}</Text>
                  {selectedRoomId === room.id && <CheckCircle2 size={16} color={Colors.primary} />}
                </TouchableOpacity>
              ))}

              {/* Max Tokens & Fee */}
              <View style={styles.timeInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Max Tokens</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={maxTokens}
                    onChangeText={setMaxTokens}
                    keyboardType="numeric"
                    placeholder="25"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Fee (₹)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={fee}
                    onChangeText={setFee}
                    keyboardType="numeric"
                    placeholder="300"
                  />
                </View>
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
                onPress={handleSaveSlot}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>
                    {editingSlotId ? 'Save Changes' : 'Confirm Slot'}
                  </Text>
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
    gap: Spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  locationBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  estName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  estSub: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  locationNote: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 4,
  },
  overridesNoticeCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  noticeIconBox: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeTextContainer: {
    flex: 1,
  },
  noticeTitle: {
    ...Typography.labelMd,
    color: Colors.warningText,
    fontWeight: '700',
  },
  noticeDesc: {
    ...Typography.bodySm,
    color: Colors.warningText,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 16,
  },
  slotsSection: {
    gap: Spacing.md,
  },
  slotsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...Typography.labelSm,
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '700',
  },
  addSlotBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.md,
  },
  addSlotBtnText: {
    ...Typography.labelSm,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  slotCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  dayBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  dayBadgeText: {
    ...Typography.labelSm,
    color: Colors.primaryDark,
    fontWeight: '700',
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  actionIconBtn: {
    padding: Spacing.xs,
  },
  slotShiftName: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  slotInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  slotTimeText: {
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  slotRoomText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  slotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
  },
  slotMetaText: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
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
    marginBottom: Spacing.lg,
  },
  emptyBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  emptyBtnText: {
    ...Typography.labelMd,
    color: '#FFFFFF',
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
  dayChipsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dayChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayChipSelected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  dayChipText: {
    ...Typography.labelSm,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  dayChipTextSelected: {
    color: Colors.primaryDark,
    fontWeight: '700',
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
  timeInputsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roomOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: Radius.md,
    marginBottom: 6,
  },
  roomOptionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  roomOptionText: {
    ...Typography.bodySm,
    color: Colors.textPrimary,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    height: 48,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  saveBtnText: {
    ...Typography.labelLg,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
