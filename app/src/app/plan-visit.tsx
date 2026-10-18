import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  X,
  Calendar,
  Clock,
  AlertCircle,
  Check,
  User,
} from 'lucide-react-native';
import { useDoctor } from '../hooks/useDoctors';
import { LoadState } from '../components/common/LoadState';
import { istToday } from '../services/doctorMapper';
import { Doctor, PracticeLocation } from '../types';
import { useApp } from '../store/AppContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

const sessionDates = (practice: PracticeLocation | undefined, locale: string) => {
  if (!practice) return [];
  const today = istToday();
  const days = new Set(practice.schedules.map((s) => s.dayOfWeek));
  const dates: { label: string; value: string; dayOfWeek: number }[] = [];
  for (let offset = 0; offset < 21 && dates.length < 6; offset++) {
    const date = new Date(`${today.date}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + offset);
    const dayOfWeek = ((date.getUTCDay() + 6) % 7) + 1;
    if (!days.has(dayOfWeek)) continue;
    const value = date.toISOString().slice(0, 10);
    if (offset === 0 && practice.schedules.filter((s) => s.dayOfWeek === dayOfWeek).every((s) => {
      const [h, m] = s.endTime.split(':').map(Number);
      return h * 60 + m <= today.minutes;
    })) continue;
    dates.push({
      value,
      dayOfWeek,
      label: date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })
    });
  }
  return dates;
};

function PlanVisit({ doctor: selectedDoctor, establishmentId }: { doctor: Doctor; establishmentId?: string }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { addVisit, language, theme, isDark } = useApp();
  const locale = language === 'bn' ? 'bn-IN' : 'en-IN';

  const initialPractice = selectedDoctor.practices.find(
    (p) => p.establishmentId === establishmentId && p.schedules.length
  ) || selectedDoctor.practices.find((p) => p.schedules.length) || selectedDoctor.practices[0];
  const initialDate = sessionDates(initialPractice, locale)[0];

  const [selectedPracticeId, setSelectedPracticeId] = useState<string>(initialPractice?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate?.value ?? '');
  const [selectedSlot, setSelectedSlot] = useState<string>(
    initialPractice?.schedules.find((s) => s.dayOfWeek === initialDate?.dayOfWeek)?.slotLabel ?? ''
  );
  const [notes, setNotes] = useState<string>('');
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  const currentPractice = selectedDoctor.practices.find((p) => p.id === selectedPracticeId) || selectedDoctor.practices[0];
  const upcomingDates = sessionDates(currentPractice, locale);
  const selectedDay = upcomingDates.find((d) => d.value === selectedDate)?.dayOfWeek;
  const daySlots = currentPractice?.schedules.filter((s) => s.dayOfWeek === selectedDay) ?? [];

  const choosePractice = (practice: PracticeLocation) => {
    const first = sessionDates(practice, locale)[0];
    setSelectedPracticeId(practice.id);
    setSelectedDate(first?.value ?? '');
    setSelectedSlot(practice.schedules.find((s) => s.dayOfWeek === first?.dayOfWeek)?.slotLabel ?? '');
  };

  const chooseDate = (value: string, dayOfWeek: number) => {
    setSelectedDate(value);
    setSelectedSlot(currentPractice?.schedules.find((s) => s.dayOfWeek === dayOfWeek)?.slotLabel ?? '');
  };

  const handleSave = async () => {
    if (!currentPractice || !selectedDate || !selectedSlot) return;
    await addVisit({
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorSpecialty: selectedDoctor.specialties[0],
      establishmentId: currentPractice.establishmentId,
      establishmentName: currentPractice.establishmentName,
      establishmentAddress: currentPractice.addressLine,
      establishmentPhone: currentPractice.phone,
      visitDate: selectedDate,
      visitTime: selectedSlot,
      reminderEnabled: true,
      notes: notes.trim() || undefined,
      status: 'planned',
    });

    setSuccessModalVisible(true);
  };

  const handleModalDone = () => {
    setSuccessModalVisible(false);
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
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          {t('plan.title')}
        </Text>
        <TouchableOpacity
          style={styles.closeBtn}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <X size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.disclaimerBox,
            {
              backgroundColor: theme.warningLight,
              borderColor: theme.warning,
            },
          ]}
        >
          <AlertCircle size={20} color={theme.warning} />
          <View style={styles.disclaimerContent}>
            <Text
              style={[styles.disclaimerTitle, { color: theme.warningText }]}
            >
              {t('common.disclaimerTitle')} (Not a Booking)
            </Text>
            <Text
              style={[styles.disclaimerText, { color: theme.warningText }]}
            >
              This sets a reminder on your phone. Doctors travel on designated days. Always call the counter before starting your journey to confirm doctor arrival.
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.doctorCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View
            style={[
              styles.doctorAvatar,
              {
                backgroundColor: isDark
                  ? theme.surfaceVariant
                  : theme.primaryLight,
              },
            ]}
          >
            <User size={22} color={theme.primaryDark} />
          </View>
          <View style={styles.doctorInfo}>
            <Text style={[styles.doctorName, { color: theme.textPrimary }]}>
              {selectedDoctor.name}
            </Text>
            <Text style={[styles.doctorSpecialty, { color: theme.primary }]}>
              {selectedDoctor.specialties[0]}
            </Text>
            <Text style={[styles.doctorQual, { color: theme.textSecondary }]}>
              {selectedDoctor.qualifications}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('plan.selectChamber')}
          </Text>
          {selectedDoctor.practices.map((practice) => {
            const isSelected = practice.id === selectedPracticeId;
            return (
              <TouchableOpacity
                key={practice.id}
                style={[
                  styles.chamberCard,
                  {
                    backgroundColor: isSelected
                      ? theme.primaryLight
                      : theme.surface,
                    borderColor: isSelected ? theme.primary : theme.border,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => choosePractice(practice)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        { backgroundColor: theme.primary },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.chamberInfo}>
                  <Text
                    style={[
                      styles.chamberName,
                      {
                        color: isSelected
                          ? theme.primaryDark
                          : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '600',
                      },
                    ]}
                  >
                    {practice.establishmentName}
                  </Text>
                  <Text
                    style={[
                      styles.chamberAddress,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {practice.addressLine}, {practice.locality}
                  </Text>
                  {practice.distanceKm !== undefined && (
                    <Text
                      style={[
                        styles.chamberDist,
                        { color: theme.primaryDark },
                      ]}
                    >
                      {practice.distanceKm} km away
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('plan.selectDate')}
          </Text>
          {upcomingDates.length === 0 && (
            <Text style={{ fontSize: 13, color: theme.textSecondary }}>{t('plan.noUpcomingSessions')}</Text>
          )}
          <View style={styles.datesGrid}>
            {upcomingDates.map((item) => {
              const isSelected = selectedDate === item.value;
              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.dateChip,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryLight
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => chooseDate(item.value, item.dayOfWeek)}
                >
                  <Calendar
                    size={14}
                    color={isSelected ? theme.primaryDark : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.dateChipText,
                      {
                        color: isSelected
                          ? theme.primaryDark
                          : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            {t('plan.selectTime')}
          </Text>
          <View style={styles.timeSlotRow}>
            {daySlots.map((sch) => {
              const isSelected = selectedSlot === sch.slotLabel;
              return (
                <TouchableOpacity
                  key={sch.id}
                  style={[
                    styles.slotChip,
                    {
                      backgroundColor: isSelected
                        ? theme.primaryLight
                        : theme.surface,
                      borderColor: isSelected ? theme.primary : theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSlot(sch.slotLabel)}
                >
                  <Clock
                    size={13}
                    color={isSelected ? theme.primaryDark : theme.textSecondary}
                  />
                  <Text
                    style={[
                      styles.slotChipText,
                      {
                        color: isSelected
                          ? theme.primaryDark
                          : theme.textPrimary,
                        fontWeight: isSelected ? '700' : '500',
                      },
                    ]}
                  >
                    {sch.slotLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
            Visit Notes (Optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.textPrimary,
              },
            ]}
            value={notes}
            onChangeText={setNotes}
            placeholder={t('plan.notesPlaceholder')}
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.surface,
            borderTopColor: theme.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: selectedSlot ? 1 : 0.5 }]}
          activeOpacity={0.8}
          onPress={handleSave}
          disabled={!selectedSlot}
        >
          <Check size={18} color={theme.textInverse} strokeWidth={2.5} />
          <Text style={[styles.saveBtnText, { color: theme.textInverse }]}>
            {t('plan.saveCta')}
          </Text>
        </TouchableOpacity>
      </View>

      <ConfirmationModal
        visible={successModalVisible}
        title={t('plan.title')}
        message={t('plan.successMsg')}
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  disclaimerBox: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimerText: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  doctorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '700',
  },
  doctorSpecialty: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  doctorQual: {
    fontSize: 11,
    marginTop: 1,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  chamberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  chamberInfo: {
    flex: 1,
  },
  chamberName: {
    fontSize: 14,
  },
  chamberAddress: {
    fontSize: 12,
    marginTop: 1,
  },
  chamberDist: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  datesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  dateChipText: {
    fontSize: 12,
  },
  timeSlotRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  slotChipText: {
    fontSize: 12,
  },
  notesInput: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 10,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default function PlanVisitScreen() {
  const params = useLocalSearchParams<{ doctorId?: string; establishmentId?: string }>();
  const query = useDoctor(params.doctorId);
  if (!query.data) {
    return <LoadState loading={query.isPending && Boolean(params.doctorId)} notFound={!params.doctorId || (query.error as { status?: number } | null)?.status === 404} onRetry={() => query.refetch()} />;
  }
  return <PlanVisit doctor={query.data} establishmentId={params.establishmentId} />;
}
