import React, { useState } from 'react';
import { todayInIndia } from '../../utils/date';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock,
  Calendar,
  MapPin,
  Phone,
  FileCheck,
  Languages,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  User,
} from 'lucide-react-native';
import { Header } from '../../components/Header';
import { StatusBadge } from '../../components/StatusBadge';
import { Colors, Spacing, Typography, Radius } from '../../constants/theme';
import { usePartner } from '../../store/PartnerContext';
import { api } from '../../services/api';

export default function DoctorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { rosterDoctors, currentEstablishment, overrides, refreshOverrides } = usePartner();

  const doctor = rosterDoctors.find((d) => d.id === id) || (rosterDoctors.length > 0 ? rosterDoctors[0] : null);

  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  if (!doctor) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <Header title="Doctor Profile" showBack backLabel="Doctors" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const todayStr = todayInIndia();
  const doctorOverrides = overrides.filter((o) => o.doctorId === doctor.id);
  const todayUnavailableOverride = doctorOverrides.find((o) => o.overrideType === 'unavailable' && o.overrideDate === todayStr);
  const isCurrentlyUnavailable = Boolean(todayUnavailableOverride);

  const handleToggleUnavailableToday = async () => {
    if (!currentEstablishment) return;
    setIsTogglingAvailability(true);

    try {
      if (todayUnavailableOverride) {
        const res = await api.deleteOverride(todayUnavailableOverride.id);
        if (!res.success) {
          Alert.alert('Not saved', res.error?.message || 'Please try again.');
          return;
        }
        await refreshOverrides();
        Alert.alert('Status Updated', `${doctor.fullName} is now marked Available for today's chamber.`);
      } else {
        // Add override
        const res = await api.createOverride({
          doctorId: doctor.id,
          establishmentId: currentEstablishment.id,
          overrideDate: todayStr,
          overrideType: 'unavailable',
          note: 'Doctor unavailable for today (Emergency / Leave)',
        });
        if (!res.success) {
          Alert.alert('Not saved', res.error?.message || 'Please try again.');
          return;
        }
        await refreshOverrides();
        Alert.alert('Status Updated', `${doctor.fullName} is now marked Not Available for today's chamber.`);
      }
    } catch {
      Alert.alert('Error', 'Could not update status. Please try again.');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <Header
        title={doctor.fullName}
        showBack
        backLabel="Doctors"
        rightAction={
          <StatusBadge
            status={isCurrentlyUnavailable ? 'not_available' : 'available_today'}
            label={isCurrentlyUnavailable ? 'Unavailable Today' : 'Available Today'}
          />
        }
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {doctor.fullName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.doctorName}>{doctor.fullName}</Text>
                <ShieldCheck size={18} color={Colors.success} />
              </View>
              <Text style={styles.specialtyText}>{doctor.specialty}</Text>
              <Text style={styles.qualificationsText}>
                {doctor.qualifications} · {doctor.experienceYears} yrs experience
              </Text>
            </View>
          </View>

          {/* Languages & Quick Action */}
          <View style={styles.quickActionStrip}>
            <View style={styles.languagesRow}>
              <Languages size={16} color={Colors.textSecondary} />
              <Text style={styles.languagesText}>
                {doctor.languages?.join(', ') || 'Bengali, English'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.quickUnavailBtn,
                isCurrentlyUnavailable && styles.quickAvailBtn,
              ]}
              onPress={handleToggleUnavailableToday}
              disabled={isTogglingAvailability}
            >
              {isTogglingAvailability ? (
                <ActivityIndicator size="small" color={isCurrentlyUnavailable ? Colors.successText : Colors.warningText} />
              ) : (
                <>
                  <AlertTriangle
                    size={14}
                    color={isCurrentlyUnavailable ? Colors.successText : Colors.warningText}
                  />
                  <Text
                    style={[
                      styles.quickUnavailText,
                      isCurrentlyUnavailable && styles.quickAvailText,
                    ]}
                  >
                    {isCurrentlyUnavailable ? 'Make Available' : 'Mark Unavailable Today'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Practice Location Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Practice Location</Text>
            </View>
            <View style={styles.primaryBadge}>
              <Text style={styles.primaryBadgeText}>Primary Facility</Text>
            </View>
          </View>
          <View style={styles.locationContent}>
            <Text style={styles.facilityName}>
              {currentEstablishment?.name}
            </Text>
            <Text style={styles.facilityAddress}>
              {currentEstablishment?.address}
            </Text>
            <Text style={styles.chamberRoom}>Chamber 1 · Ground Floor (Room MMC-01)</Text>
          </View>
        </View>

        {/* Weekly Regular Schedule Card */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <Calendar size={18} color={Colors.primary} />
              <Text style={styles.cardTitle}>Regular Weekly Schedule</Text>
            </View>
            <TouchableOpacity onPress={() => router.push(`/doctor/schedule/${doctor.id}`)}>
              <Text style={styles.manageLink}>Edit Schedule</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.scheduleSlot}>
            <View style={styles.slotTimeRow}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.slotDay}>Thursday</Text>
              <Text style={styles.slotHours}>5:00 PM – 7:00 PM</Text>
            </View>
            <Text style={styles.slotMeta}>
              Evening General Consultation · Max 25 Tokens · Fee: ₹300
            </Text>
          </View>

          <View style={styles.scheduleSlot}>
            <View style={styles.slotTimeRow}>
              <Clock size={16} color={Colors.primary} />
              <Text style={styles.slotDay}>Friday</Text>
              <Text style={styles.slotHours}>4:00 PM – 6:30 PM</Text>
            </View>
            <Text style={styles.slotMeta}>
              Specialist Consultation · Max 20 Tokens · Fee: ₹300
            </Text>
          </View>
        </View>

        {/* Temporary Changes Card */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/doctor/overrides/${doctor.id}`)}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderLeft}>
              <AlertTriangle size={18} color={Colors.warning} />
              <Text style={styles.cardTitle}>Temporary Changes</Text>
            </View>
            <View style={styles.overridesCountBadge}>
              <Text style={styles.overridesCountText}>
                {doctorOverrides.length} Active Overrides
              </Text>
            </View>
          </View>

          <Text style={styles.cardDesc}>
            Manage specific date leaves, road delays, or additional morning chambers for {doctor.fullName}.
          </Text>

          <View style={styles.navRowAction}>
            <Text style={styles.navRowActionText}>Manage temporary changes</Text>
            <ChevronRight size={16} color={Colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Clinical Registration Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verification & Registration</Text>

          <View style={styles.regRow}>
            <FileCheck size={18} color={Colors.primary} />
            <View style={styles.regContent}>
              <Text style={styles.regLabel}>Registration Number</Text>
              <Text style={styles.regValue}>{doctor.registrationNumber || 'WBMC-49201'}</Text>
            </View>
          </View>

          <View style={styles.regRow}>
            <ShieldCheck size={18} color={Colors.primary} />
            <View style={styles.regContent}>
              <Text style={styles.regLabel}>Medical Council</Text>
              <Text style={styles.regValue}>{doctor.council || 'West Bengal Medical Council'}</Text>
            </View>
          </View>

          <View style={styles.regRow}>
            <Phone size={18} color={Colors.primary} />
            <View style={styles.regContent}>
              <Text style={styles.regLabel}>Doctor Contact Phone</Text>
              <Text style={styles.regValue}>{doctor.primaryPhone || '+91 98320 54119'}</Text>
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  specialtyText: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  qualificationsText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  quickActionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  languagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  languagesText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    fontSize: 12,
  },
  quickUnavailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.md,
    backgroundColor: Colors.warningLight,
  },
  quickUnavailText: {
    ...Typography.labelSm,
    color: Colors.warningText,
    fontWeight: '700',
  },
  quickAvailBtn: {
    backgroundColor: Colors.successLight,
  },
  quickAvailText: {
    color: Colors.successText,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  cardTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
  },
  primaryBadge: {
    backgroundColor: Colors.surfaceVariant,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  primaryBadgeText: {
    ...Typography.labelSm,
    fontSize: 10,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  locationContent: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  facilityName: {
    ...Typography.labelLg,
    color: Colors.textPrimary,
  },
  facilityAddress: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  chamberRoom: {
    ...Typography.labelSm,
    color: Colors.primary,
    marginTop: 4,
  },
  manageLink: {
    ...Typography.labelSm,
    color: Colors.primary,
    fontWeight: '700',
  },
  scheduleSlot: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.sm,
    gap: 4,
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  slotDay: {
    ...Typography.labelMd,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  slotHours: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginLeft: Spacing.xs,
  },
  slotMeta: {
    ...Typography.bodySm,
    fontSize: 11,
    color: Colors.textMuted,
    marginLeft: 22,
  },
  overridesCountBadge: {
    backgroundColor: Colors.warningLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  overridesCountText: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.warningText,
    fontWeight: '700',
  },
  cardDesc: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  navRowAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  navRowActionText: {
    ...Typography.labelMd,
    color: Colors.primary,
    fontWeight: '700',
  },
  regRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  regContent: {
    flex: 1,
  },
  regLabel: {
    ...Typography.labelSm,
    fontSize: 11,
    color: Colors.textMuted,
  },
  regValue: {
    ...Typography.bodyMd,
    color: Colors.textPrimary,
    fontWeight: '500',
    marginTop: 1,
  },
});
