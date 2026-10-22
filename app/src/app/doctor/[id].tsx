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
  Share2,
  Phone,
  Navigation,
  Award,
  Languages,
  IndianRupee,
  HelpCircle,
  CalendarPlus,
  AlertTriangle,
  MapPin,
} from 'lucide-react-native';
import { useDoctor } from '../../hooks/useDoctors';
import { LoadState } from '../../components/common/LoadState';
import { Doctor, PracticeLocation, ScheduleItem } from '../../types';
import { useApp } from '../../store/AppContext';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { ThemeColors } from '../../constants/theme';
import { getSpecialtyInfo } from '../../data/specialties';
import { findNextSitting } from '../../services/sittings';
import { shareDoctor } from '../../services/share';

const LANGUAGE_BN: Record<string, string> = {
  Bengali: 'বাংলা',
  English: 'ইংরেজি',
  Hindi: 'হিন্দি',
  Santali: 'সাঁওতালি',
  Odia: 'ওড়িয়া',
  Urdu: 'উর্দু',
};

const groupByDay = (schedules: ScheduleItem[]) =>
  schedules.reduce<ScheduleItem[][]>((days, schedule) => {
    const last = days[days.length - 1];
    if (last && last[0].dayOfWeek === schedule.dayOfWeek) last.push(schedule);
    else days.push([schedule]);
    return days;
  }, []);

const fullAddress = (practice: PracticeLocation) => {
  const address = practice.addressLine.toLowerCase();
  const extra = practice.locality.split(',').map((part) => part.trim()).filter((part) => part && !address.includes(part.toLowerCase()));
  return [practice.addressLine, ...extra].filter(Boolean).join(', ');
};

const dial = (phone?: string) => {
  if (phone) Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`);
};

const openDirections = (practice: PracticeLocation) =>
  Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${practice.latitude},${practice.longitude}`);

function DoctorProfile({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme, isDark } = useApp();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const bn = language === 'bn';

  const doctorName = bn && doctor.nameBn ? doctor.nameBn : doctor.name;
  const specialty = bn && doctor.specialtiesBn.length ? doctor.specialtiesBn[0] : doctor.specialties[0];
  const info = getSpecialtyInfo(doctor.specialties[0]);
  const next = findNextSitting(doctor.practices);
  const callTarget = next?.practice ?? doctor.practices.find((p) => p.phone) ?? null;
  const callNumber = callTarget?.phone || doctor.phone;
  const accentText = isDark ? theme.primary : theme.primaryDark;

  const dayLabel = () => {
    if (!next) return '';
    if (next.isOngoing) return t('doctor.sittingNow');
    if (next.dayOffset === 0) return t('doctor.today');
    if (next.dayOffset === 1) return t('doctor.tomorrow');
    return new Date(`${next.date}T00:00:00Z`).toLocaleDateString(bn ? 'bn-IN' : 'en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    });
  };

  const slot = (schedule: { slotLabel: string; slotLabelBn: string }) => (bn ? schedule.slotLabelBn : schedule.slotLabel);

  const facts = [
    doctor.experienceYears > 0 && { key: 'exp', Icon: Award, label: t('doctor.yearsExperience', { count: doctor.experienceYears }) },
    doctor.languages.length > 0 && { key: 'lang', Icon: Languages, label: doctor.languages.map((l) => (bn ? LANGUAGE_BN[l] ?? l : l)).join(', ') },
    {
      key: 'fee',
      Icon: IndianRupee,
      label: doctor.consultationFee ? t('doctor.feeAmount', { amount: doctor.consultationFee }) : t('doctor.feeAtCounter'),
    },
  ].filter(Boolean) as { key: string; Icon: typeof Award; label: string }[];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={() => router.back()} hitSlop={8}>
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('doctor.screenTitle')}</Text>
        <TouchableOpacity style={styles.headerBtn} activeOpacity={0.7} onPress={() => shareDoctor(doctor, language)} hitSlop={8}>
          <Share2 size={18} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <Text style={styles.plainSpecialty}>{info ? (bn ? info.plain.bn : info.plain.en) : specialty}</Text>
          <Text style={styles.doctorName}>{doctorName}</Text>
          {info ? <Text style={styles.specialty}>{specialty}</Text> : null}
          {doctor.qualifications ? <Text style={styles.qualifications}>{doctor.qualifications}</Text> : null}

          <View style={styles.facts}>
            {facts.map(({ key, Icon, label }) => (
              <View key={key} style={styles.fact}>
                <Icon size={14} color={theme.textSecondary} />
                <Text style={styles.factText}>{label}</Text>
              </View>
            ))}
          </View>

          <VerifiedBadge
            date={doctor.lastVerifiedAt}
            isStale={doctor.verificationStatus === 'unverified'}
            isPending={doctor.verificationStatus === 'pending'}
            canCall={Boolean(callNumber)}
          />
        </View>

        <View style={styles.nextPanel}>
          <Text style={styles.nextLabel}>{t('doctor.nextSitting')}</Text>
          {next ? (
            <>
              <Text style={styles.nextDay}>{dayLabel()}</Text>
              <Text style={styles.nextTime}>
                {next.isOngoing
                  ? t('doctor.untilTime', { time: slot(next.schedule).split('–')[1]?.trim() })
                  : slot(next.schedule)}
              </Text>
              <View style={styles.nextPlaceRow}>
                <MapPin size={14} color={theme.textInverse} />
                <Text style={styles.nextPlace} numberOfLines={2}>
                  {next.practice.establishmentName}
                </Text>
                {next.practice.distanceKm !== undefined && (
                  <Text style={styles.nextDistance}>{next.practice.distanceKm} km</Text>
                )}
              </View>
              {next.practice.locality ? <Text style={styles.nextLocality}>{next.practice.locality}</Text> : null}
              {next.dayOffset === 0 && next.practice.notes ? (
                <View style={styles.nextNote}>
                  <AlertTriangle size={13} color={theme.textInverse} />
                  <Text style={styles.nextNoteText}>
                    {bn && next.practice.notesBn ? next.practice.notesBn : next.practice.notes}
                  </Text>
                </View>
              ) : null}
            </>
          ) : (
            <Text style={styles.nextEmpty}>
              {!doctor.practices.some((p) => p.schedules.length)
                ? t('doctor.noTimingsYet')
                : callNumber
                  ? t('doctor.noUpcoming')
                  : t('doctor.noUpcomingNoPhone')}
            </Text>
          )}
        </View>

        {info ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('doctor.visitFor')}</Text>
            <View style={styles.conditions}>
              {info.conditions.map((condition) => (
                <View key={condition.en} style={styles.condition}>
                  <Text style={[styles.conditionText, { color: accentText }]}>{bn ? condition.bn : condition.en}</Text>
                </View>
              ))}
            </View>
            <Text style={styles.footnote}>{t('doctor.conditionsNote')}</Text>
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('doctor.practices')} ({doctor.practices.length})
          </Text>
          {doctor.practices.map((practice) => (
            <View key={practice.id} style={styles.chamber}>
              <View style={styles.chamberHead}>
                <View style={styles.chamberTitleCol}>
                  <Text style={styles.chamberName}>{practice.establishmentName}</Text>
                  <Text style={styles.chamberAddress}>{fullAddress(practice)}</Text>
                </View>
                {practice.distanceKm !== undefined && <Text style={styles.distance}>{practice.distanceKm} km</Text>}
              </View>

              <Text style={styles.timingsLabel}>{t('doctor.weeklyTimings')}</Text>
              {groupByDay(practice.schedules).map((day) => {
                const isToday = day[0].isToday;
                return (
                  <View key={day[0].id} style={[styles.timingRow, isToday && styles.timingRowToday]}>
                    <Text style={[styles.timingDay, isToday && styles.timingToday]}>
                      {bn ? day[0].dayNameBn : day[0].dayName}
                    </Text>
                    <View style={styles.timingSlots}>
                      {day.map((schedule) => (
                        <Text key={schedule.id} style={[styles.timingSlot, isToday && styles.timingToday]}>
                          {slot(schedule)}
                        </Text>
                      ))}
                    </View>
                  </View>
                );
              })}

              <View style={styles.chamberActions}>
                {practice.hasExactLocation ? (
                  <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={() => openDirections(practice)}>
                    <Navigation size={14} color={accentText} />
                    <Text style={[styles.secondaryBtnText, { color: accentText }]}>{t('common.directions')}</Text>
                  </TouchableOpacity>
                ) : null}
                {practice.phone && practice.id !== callTarget?.id ? (
                  <TouchableOpacity style={styles.secondaryBtn} activeOpacity={0.7} onPress={() => dial(practice.phone)}>
                    <Phone size={14} color={accentText} />
                    <Text style={[styles.secondaryBtnText, { color: accentText }]}>{t('doctor.callCounter')}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.reportLink}
          activeOpacity={0.7}
          onPress={() => router.push({ pathname: '/report', params: { doctorId: doctor.id } })}
        >
          <HelpCircle size={15} color={theme.textMuted} />
          <Text style={styles.reportText}>{t('doctor.reportIncorrect')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.planBtn}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: '/plan-visit',
              params: { doctorId: doctor.id, establishmentId: next?.practice.establishmentId },
            })
          }
        >
          <CalendarPlus size={18} color={accentText} />
          <Text style={[styles.planBtnText, { color: accentText }]} numberOfLines={1}>
            {t('common.planVisit')}
          </Text>
        </TouchableOpacity>
        {callNumber ? (
          <TouchableOpacity style={styles.callBtn} activeOpacity={0.85} onPress={() => dial(callNumber)}>
            <Phone size={18} color={theme.textInverse} />
            <Text style={styles.callBtnText} numberOfLines={1}>
              {doctor.practices.length > 1 && callTarget
                ? t('doctor.callChamber', { name: callTarget.establishmentName })
                : t('doctor.callCounter')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDoctor(id);
  if (!query.data) {
    return (
      <LoadState
        loading={query.isPending && Boolean(id)}
        notFound={(query.error as { status?: number } | null)?.status === 404 || !id}
        onRetry={() => query.refetch()}
      />
    );
  }
  return <DoctorProfile doctor={query.data} />;
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
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      backgroundColor: theme.surface,
    },
    headerBtn: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    scroll: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    identity: {
      backgroundColor: theme.surface,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 18,
      gap: 4,
    },
    plainSpecialty: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.primary,
    },
    doctorName: {
      fontSize: 24,
      lineHeight: 30,
      fontWeight: '800',
      color: theme.textPrimary,
    },
    specialty: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    qualifications: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.textMuted,
    },
    facts: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 10,
      marginBottom: 8,
    },
    fact: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.surfaceVariant,
    },
    factText: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    nextPanel: {
      marginHorizontal: 16,
      marginTop: 16,
      padding: 18,
      borderRadius: 16,
      backgroundColor: theme.primary,
    },
    nextLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textInverse,
      opacity: 0.8,
    },
    nextDay: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.textInverse,
      marginTop: 6,
    },
    nextTime: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: '800',
      color: theme.textInverse,
    },
    nextPlaceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 12,
    },
    nextPlace: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.textInverse,
    },
    nextDistance: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textInverse,
    },
    nextLocality: {
      fontSize: 13,
      color: theme.textInverse,
      opacity: 0.85,
      marginLeft: 20,
      marginTop: 2,
    },
    nextNote: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
      marginTop: 12,
      padding: 10,
      borderRadius: 10,
      backgroundColor: 'rgba(0,0,0,0.15)',
    },
    nextNoteText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      color: theme.textInverse,
    },
    nextEmpty: {
      fontSize: 16,
      lineHeight: 22,
      fontWeight: '600',
      color: theme.textInverse,
      marginTop: 6,
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: theme.textPrimary,
      marginBottom: 10,
    },
    conditions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    condition: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 18,
      backgroundColor: theme.primaryMuted,
    },
    conditionText: {
      fontSize: 14,
      fontWeight: '600',
    },
    footnote: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 10,
    },
    chamber: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 14,
      padding: 16,
      marginBottom: 12,
    },
    chamberHead: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
    },
    chamberTitleCol: {
      flex: 1,
      gap: 2,
    },
    chamberName: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.textPrimary,
    },
    chamberAddress: {
      fontSize: 13,
      lineHeight: 18,
      color: theme.textSecondary,
    },
    distance: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.textSecondary,
    },
    timingsLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.textMuted,
      marginTop: 14,
      marginBottom: 4,
    },
    timingRow: {
      flexDirection: 'row',
      paddingVertical: 7,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    timingRowToday: {
      backgroundColor: theme.primaryMuted,
    },
    timingDay: {
      width: 110,
      fontSize: 14,
      color: theme.textSecondary,
    },
    timingSlots: {
      flex: 1,
      gap: 2,
    },
    timingSlot: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    timingToday: {
      color: theme.primary,
      fontWeight: '700',
    },
    chamberActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 14,
    },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.border,
    },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '600',
    },
    reportLink: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 16,
      marginTop: 4,
    },
    reportText: {
      fontSize: 13,
      color: theme.textMuted,
      textDecorationLine: 'underline',
    },
    bottomBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    planBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: theme.border,
    },
    planBtnText: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '700',
    },
    callBtn: {
      flex: 1.6,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      paddingHorizontal: 12,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    callBtnText: {
      flexShrink: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.textInverse,
    },
  });
