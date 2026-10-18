import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft,
  Share2,
  Calendar,
  Clock,
  Building2,
  Phone,
  Navigation,
  CheckCircle2,
  Award,
  Globe,
  IndianRupee,
  ChevronRight,
  HelpCircle,
  CalendarPlus,
  Ticket,
} from 'lucide-react-native';
import { useDoctor } from '../../hooks/useDoctors';
import { LoadState } from '../../components/common/LoadState';
import { Doctor } from '../../types';
import { useApp } from '../../store/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';
import { GlowingIcon } from '../../components/common/GlowingIcon';

function DoctorProfile({ doctor }: { doctor: Doctor }) {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme, isDark } = useApp();


  const doctorName = language === 'bn' && doctor.nameBn ? doctor.nameBn : doctor.name;
  const specialty = language === 'bn' && doctor.specialtiesBn.length > 0
    ? doctor.specialtiesBn[0]
    : doctor.specialties[0];
  const bio = language === 'bn' && doctor.bioBn ? doctor.bioBn : doctor.bio;

  const handleShare = async () => {
    try {
      const primaryPractice = doctor.practices[0];
      const chamber = primaryPractice?.establishmentName || 'Chamber';
      const schedule = primaryPractice?.schedules[0]
        ? `${language === 'bn' ? primaryPractice.schedules[0].dayNameBn : primaryPractice.schedules[0].dayName} (${primaryPractice.schedules[0].startTime}-${primaryPractice.schedules[0].endTime})`
        : '';
      const phone = primaryPractice?.phone || '';
      const message = `🩺 ${doctorName} (${specialty})\n📍 ${chamber}\n⏰ ${schedule}\n📞 Counter Phone: ${phone}\nShared via DocTimings`;
      await Share.share({ message });
    } catch {}
  };

  const handleCall = (phone?: string) => {
    const targetPhone = phone || doctor.practices[0]?.phone || doctor.phone;
    if (targetPhone) {
      Linking.openURL(`tel:${targetPhone.replace(/\s+/g, '')}`);
    }
  };

  const handleDirections = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
  };

  const daysOfWeek = [
    { key: 1, name: 'Mon', nameBn: 'সোম' },
    { key: 2, name: 'Tue', nameBn: 'মঙ্গল' },
    { key: 3, name: 'Wed', nameBn: 'বুধ' },
    { key: 4, name: 'Thu', nameBn: 'বৃহঃ' },
    { key: 5, name: 'Fri', nameBn: 'শুক্র' },
    { key: 6, name: 'Sat', nameBn: 'শনি' },
    { key: 7, name: 'Sun', nameBn: 'রবি' },
  ];

  const getDayPractice = (dayNum: number) => {
    for (const p of doctor.practices) {
      const match = p.schedules.find((s) => s.dayOfWeek === dayNum);
      if (match) {
        return {
          chamber: p.establishmentName.split(' ')[0],
          time: match.slotLabel,
        };
      }
    }
    return null;
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
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
          Doctor Profile
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={handleShare}
          >
            <Share2 size={18} color={theme.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.heroCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <GlowingIcon glowColor={theme.glowPrimary} size={64} pulse>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark
                      ? theme.surfaceVariant
                      : theme.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: isDark ? theme.primary : theme.primaryDark },
                  ]}
                >
                  {doctor.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                </Text>
              </View>
            </GlowingIcon>
            <View style={styles.heroInfo}>
              <Text
                style={[styles.doctorName, { color: theme.textPrimary }]}
              >
                {doctorName}
              </Text>
              <Text style={[styles.specialtyText, { color: theme.primary }]}>
                {specialty}
              </Text>
              <Text
                style={[styles.qualText, { color: theme.textSecondary }]}
              >
                {doctor.qualifications}
              </Text>
            </View>
          </View>

          <View style={styles.statusSection}>
            <StatusBadge status={doctor.todayAvailability} size="md" />
            <VerifiedBadge
              date={doctor.lastVerifiedAt}
              isStale={doctor.verificationStatus === 'unverified'}
            />
          </View>

          <View
            style={[
              styles.statsGrid,
              {
                backgroundColor: isDark
                  ? theme.surfaceVariant
                  : theme.background,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Award size={16} color={theme.primary} />
              <Text
                style={[styles.statValue, { color: theme.textPrimary }]}
              >
                {doctor.experienceYears}+ Yrs
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Experience
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <IndianRupee size={16} color={theme.primary} />
              <Text
                style={[styles.statValue, { color: theme.textPrimary }]}
              >
                {doctor.consultationFee ? `₹${doctor.consultationFee}` : t('doctor.askAtCounter')}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                {t('doctor.fee')}
              </Text>
            </View>

            <View style={styles.statDivider} />

            <View style={styles.statItem}>
              <Globe size={16} color={theme.primary} />
              <Text
                style={[styles.statValue, { color: theme.textPrimary }]}
              >
                {doctor.languages.slice(0, 2).join(', ')}
              </Text>
              <Text
                style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                Languages
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.itineraryCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <Text
            style={[styles.itineraryTitle, { color: theme.textPrimary }]}
          >
            {language === 'bn'
              ? 'সাপ্তাহিক চেম্বার রুটিন (কোথায় কোন দিন?)'
              : 'Weekly Visiting Roster'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.itineraryTrack}
          >
            {daysOfWeek.map((d) => {
              const sitting = getDayPractice(d.key);
              return (
                <View
                  key={d.key}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor: sitting
                        ? isDark
                          ? theme.surfaceVariant
                          : theme.primaryLight
                        : isDark
                        ? theme.background
                        : '#F1F5F9',
                      borderColor: sitting ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.dayPillHeader,
                      { color: sitting ? theme.primaryDark : theme.textMuted },
                    ]}
                  >
                    {language === 'bn' ? d.nameBn : d.name}
                  </Text>
                  {sitting ? (
                    <>
                      <Text
                        style={[
                          styles.dayPillChamber,
                          { color: theme.textPrimary },
                        ]}
                        numberOfLines={1}
                      >
                        {sitting.chamber}
                      </Text>
                      <Text
                        style={[
                          styles.dayPillTime,
                          { color: theme.primaryDark },
                        ]}
                        numberOfLines={1}
                      >
                        {sitting.time.split('–')[0]}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[styles.dayPillEmpty, { color: theme.textMuted }]}
                    >
                      {language === 'bn' ? 'বন্ধ' : 'Off'}
                    </Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            {t('doctor.practices')} ({doctor.practices.length})
          </Text>

          {doctor.practices.map((practice) => (
            <View
              key={practice.id}
              style={[
                styles.practiceCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.practiceHeader}>
                <Building2 size={16} color={theme.primary} />
                <View style={styles.practiceHeaderInfo}>
                  <Text
                    style={[
                      styles.practiceName,
                      { color: theme.textPrimary },
                    ]}
                  >
                    {practice.establishmentName}
                  </Text>
                  <Text
                    style={[
                      styles.practiceAddress,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {practice.addressLine}, {practice.locality}
                  </Text>
                </View>
                {practice.distanceKm !== undefined && (
                  <Text
                    style={[
                      styles.practiceDistance,
                      {
                        backgroundColor: theme.primaryLight,
                        color: theme.primaryDark,
                      },
                    ]}
                  >
                    {practice.distanceKm} km
                  </Text>
                )}
              </View>

              <View
                style={[
                  styles.schedulesBox,
                  {
                    backgroundColor: isDark
                      ? theme.surfaceVariant
                      : theme.background,
                    borderColor: theme.border,
                  },
                ]}
              >
                {practice.schedules.map((schedule) => (
                  <View key={schedule.id} style={styles.scheduleRow}>
                    <Clock size={13} color={theme.textSecondary} />
                    <Text
                      style={[
                        styles.scheduleDay,
                        { color: theme.textPrimary },
                      ]}
                    >
                      {language === 'bn' ? schedule.dayNameBn : schedule.dayName}:
                    </Text>
                    <Text
                      style={[
                        styles.scheduleHours,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {language === 'bn' ? schedule.slotLabelBn : schedule.slotLabel}
                    </Text>
                  </View>
                ))}
              </View>

              {practice.notes && (
                <Text
                  style={[styles.practiceNotes, { color: theme.textMuted }]}
                >
                  {language === 'bn' && practice.notesBn ? practice.notesBn : practice.notes}
                </Text>
              )}

              <View style={styles.practiceActions}>
                <TouchableOpacity
                  style={[
                    styles.planBtn,
                    {
                      backgroundColor: isDark
                        ? theme.surfaceVariant
                        : theme.background,
                      borderColor: theme.border,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    router.push({
                      pathname: '/plan-visit',
                      params: {
                        doctorId: doctor.id,
                        establishmentId: practice.establishmentId,
                      },
                    })
                  }
                >
                  <CalendarPlus size={14} color={theme.textSecondary} />
                  <Text
                    style={[
                      styles.planBtnText,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {t('common.planVisit')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.dirBtn,
                    {
                      backgroundColor: theme.primaryLight,
                      borderColor: theme.primary,
                    },
                  ]}
                  activeOpacity={0.7}
                  onPress={() =>
                    handleDirections(practice.latitude, practice.longitude)
                  }
                >
                  <Navigation size={13} color={theme.primaryDark} />
                  <Text
                    style={[
                      styles.dirBtnText,
                      { color: theme.primaryDark },
                    ]}
                  >
                    {t('common.directions')}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.callBtn, { backgroundColor: theme.primary }]}
                  activeOpacity={0.8}
                  onPress={() => handleCall(practice.phone)}
                >
                  <Phone size={13} color={theme.textInverse} />
                  <Text
                    style={[styles.callBtnText, { color: theme.textInverse }]}
                  >
                    {t('common.call')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.reportBtn,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: '/report',
              params: { doctorId: doctor.id },
            })
          }
        >
          <HelpCircle size={15} color={theme.warning} />
          <Text style={[styles.reportText, { color: theme.textSecondary }]}>
            {t('doctor.reportIncorrect')}
          </Text>
        </TouchableOpacity>
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
          style={[
            styles.bottomPlanBtn,
            {
              backgroundColor: isDark
                ? theme.surfaceVariant
                : theme.background,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.8}
          onPress={() =>
            router.push({
              pathname: '/plan-visit',
              params: { doctorId: doctor.id },
            })
          }
        >
          <CalendarPlus size={16} color={theme.textSecondary} />
          <Text
            style={[
              styles.bottomPlanBtnText,
              { color: theme.textSecondary },
            ]}
          >
            {t('common.planVisit')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bottomCallBtn, { backgroundColor: theme.primary }]}
          activeOpacity={0.8}
          onPress={() => handleCall()}
        >
          <Phone size={16} color={theme.textInverse} />
          <Text
            style={[
              styles.bottomCallBtnText,
              { color: theme.textInverse },
            ]}
          >
            {t('common.call')}
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  heroCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  heroInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
  },
  specialtyText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  qualText: {
    fontSize: 12,
    marginTop: 2,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  itineraryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  itineraryTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  itineraryTrack: {
    gap: 8,
  },
  dayPill: {
    width: 72,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  dayPillHeader: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  dayPillChamber: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  dayPillTime: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 2,
  },
  dayPillEmpty: {
    fontSize: 11,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  practiceCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  practiceHeaderInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 14,
    fontWeight: '700',
  },
  practiceAddress: {
    fontSize: 12,
    marginTop: 1,
  },
  practiceDistance: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  schedulesBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleDay: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleHours: {
    fontSize: 12,
  },
  practiceNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
  practiceActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  planBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  planBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dirBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  dirBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  reportText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  bottomPlanBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bottomPlanBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  bottomCallBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 8,
  },
  bottomCallBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const query = useDoctor(id);
  if (!query.data) {
    return <LoadState loading={query.isPending && Boolean(id)} notFound={(query.error as { status?: number } | null)?.status === 404 || !id} onRetry={() => query.refetch()} />;
  }
  return <DoctorProfile doctor={query.data} />;
}
