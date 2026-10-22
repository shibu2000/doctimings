import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react-native';
import { useDoctor } from '../../../hooks/useDoctors';
import { LoadState } from '../../../components/common/LoadState';
import { Doctor } from '../../../types';
import { ThemeColors } from '../../../constants/theme';
import { useApp } from '../../../store/AppContext';
import { StatusBadge } from '../../../components/common/StatusBadge';

function DoctorAvailability({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme } = useApp();
  const styles = useMemo(() => createStyles(theme), [theme]);


  const daysOfWeek = [
    { dayNum: 1, nameEn: 'Monday', nameBn: 'সোমবার' },
    { dayNum: 2, nameEn: 'Tuesday', nameBn: 'মঙ্গলবার' },
    { dayNum: 3, nameEn: 'Wednesday', nameBn: 'বুধবার' },
    { dayNum: 4, nameEn: 'Thursday', nameBn: 'বৃহস্পতিবার' },
    { dayNum: 5, nameEn: 'Friday', nameBn: 'শুক্রবার' },
    { dayNum: 6, nameEn: 'Saturday', nameBn: 'শনিবার' },
    { dayNum: 7, nameEn: 'Sunday', nameBn: 'রবিবার' },
  ];

  const getSittingsForDay = (dayNum: number) => {
    const sittings: {
      practiceName: string;
      locality: string;
      slot: string;
      phone: string;
      notes?: string;
    }[] = [];

    doctor.practices.forEach((practice) => {
      practice.schedules.forEach((sch) => {
        if (sch.dayOfWeek === dayNum) {
          sittings.push({
            practiceName: practice.establishmentName,
            locality: practice.locality,
            slot: language === 'bn' ? sch.slotLabelBn : sch.slotLabel,
            phone: practice.phone,
            notes: practice.notes,
          });
        }
      });
    });

    return sittings;
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
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
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle}>Doctor Availability</Text>
          <Text style={styles.headerSub}>{doctor.name}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusBox}>
          <Text style={styles.statusTitle}>Today's Availability</Text>
          <View style={styles.statusRow}>
            <StatusBadge status={doctor.todayAvailability} />
            <Text style={styles.verifiedText}>Verified by counter staff</Text>
          </View>
        </View>

        <View style={styles.disclaimerAlert}>
          <AlertCircle size={18} color={theme.warning} />
          <View style={styles.disclaimerContent}>
            <Text style={styles.disclaimerTitle}>{t('common.disclaimerTitle')}</Text>
            <Text style={styles.disclaimerBody}>{t('common.disclaimerBody')}</Text>
          </View>
        </View>

        <Text style={styles.weeklyTitle}>Weekly Sitting Roster</Text>

        <View style={styles.rosterList}>
          {daysOfWeek.map((day) => {
            const sittings = getSittingsForDay(day.dayNum);
            const isToday = new Date().getDay() === (day.dayNum === 7 ? 0 : day.dayNum);
            const dayName = language === 'bn' ? day.nameBn : day.nameEn;

            return (
              <View
                key={day.dayNum}
                style={[styles.dayCard, isToday && styles.dayCardToday]}
              >
                <View style={styles.dayHeader}>
                  <Text style={[styles.dayName, isToday && styles.dayNameToday]}>
                    {dayName}
                  </Text>
                  {isToday && (
                    <View style={styles.todayPill}>
                      <Text style={styles.todayPillText}>Today</Text>
                    </View>
                  )}
                </View>

                {sittings.length > 0 ? (
                  sittings.map((sitting, idx) => (
                    <View key={idx} style={styles.sittingItem}>
                      <View style={styles.sittingMain}>
                        <Building2 size={13} color={theme.primary} />
                        <Text style={styles.chamberName}>{sitting.practiceName}</Text>
                      </View>

                      <View style={styles.slotRow}>
                        <Clock size={12} color={theme.textSecondary} />
                        <Text style={styles.slotText}>{sitting.slot}</Text>
                      </View>

                      {sitting.notes && (
                        <Text style={styles.notesText}>{sitting.notes}</Text>
                      )}

                      <TouchableOpacity
                        style={styles.callCounterBtn}
                        activeOpacity={0.8}
                        onPress={() => handleCall(sitting.phone)}
                      >
                        <Phone size={12} color={theme.primaryDark} />
                        <Text style={styles.callCounterText}>
                          {t('common.call')} ({sitting.phone})
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noSittingsText}>No scheduled sitting</Text>
                )}
              </View>
            );
          })}
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
  headerTitleBox: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  headerSub: {
    fontSize: 12,
    color: theme.textSecondary,
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  statusBox: {
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedText: {
    fontSize: 11,
    color: theme.textMuted,
  },
  disclaimerAlert: {
    backgroundColor: theme.warningLight,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  disclaimerContent: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.warningText,
  },
  disclaimerBody: {
    fontSize: 11,
    color: theme.warningText,
    marginTop: 2,
    lineHeight: 16,
  },
  weeklyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 10,
  },
  rosterList: {
    gap: 10,
  },
  dayCard: {
    backgroundColor: theme.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 12,
  },
  dayCardToday: {
    borderColor: theme.primary,
    backgroundColor: theme.primaryMuted,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    paddingBottom: 6,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  dayNameToday: {
    color: theme.primary,
  },
  todayPill: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.primaryDark,
  },
  sittingItem: {
    marginTop: 6,
    paddingTop: 4,
  },
  sittingMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chamberName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  slotText: {
    fontSize: 12,
    color: theme.primaryDark,
    fontWeight: '600',
  },
  notesText: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 3,
    fontStyle: 'italic',
  },
  callCounterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  callCounterText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.primaryDark,
  },
  noSittingsText: {
    fontSize: 12,
    color: theme.textMuted,
    fontStyle: 'italic',
  },
});

export default function DoctorAvailabilityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDoctor(id);
  if (!query.data) {
    return <LoadState loading={query.isPending && Boolean(id)} notFound={(query.error as { status?: number } | null)?.status === 404 || !id} onRetry={() => query.refetch()} />;
  }
  return <DoctorAvailability doctor={query.data} />;
}
