import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Phone, Navigation, Clock, CalendarPlus, Share2, Ticket } from 'lucide-react-native';
import { Doctor } from '../../types';
import { useApp } from '../../store/AppContext';
import { StatusBadge } from './StatusBadge';
import { VerifiedBadge } from './VerifiedBadge';
import { shareDoctor } from '../../services/share';

interface DoctorCardProps {
  doctor: Doctor;
  onPress?: () => void;
}

const DoctorCardView: React.FC<DoctorCardProps> = ({ doctor, onPress }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, theme, isDark } = useApp();

  const primaryPractice = doctor.practices[0];
  const primarySchedule = primaryPractice?.schedules[0];

  const doctorName = language === 'bn' && doctor.nameBn ? doctor.nameBn : doctor.name;
  const specialty = language === 'bn' && doctor.specialtiesBn.length > 0
    ? doctor.specialtiesBn[0]
    : doctor.specialties[0];

  const callNumber = primaryPractice?.phone || doctor.phone;

  const handleCall = () => {
    if (callNumber) Linking.openURL(`tel:${callNumber.replace(/\s+/g, '')}`);
  };

  const handleDirections = () => {
    if (primaryPractice?.latitude && primaryPractice?.longitude) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${primaryPractice.latitude},${primaryPractice.longitude}`;
      Linking.openURL(url);
    }
  };

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/doctor/${doctor.id}`);
    }
  };

  const handlePlanVisit = () => {
    router.push({
      pathname: '/plan-visit',
      params: { doctorId: doctor.id },
    });
  };

  const tokenText = language === 'bn'
    ? primaryPractice?.tokenInfoBn || 'কাউন্টার টোকেন আবশ্যক'
    : primaryPractice?.tokenInfo || 'Counter token required';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
        },
      ]}
      activeOpacity={0.9}
      onPress={handleCardPress}
    >
      <View style={styles.headerRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: isDark ? theme.surfaceVariant : theme.primaryLight },
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

        <View style={styles.infoCol}>
          <View style={styles.titleRow}>
            <Text
              style={[styles.doctorName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {doctorName}
            </Text>
            <TouchableOpacity
              style={styles.shareBtn}
              activeOpacity={0.7}
              onPress={() => shareDoctor(doctor, language)}
            >
              <Share2 size={15} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
          <Text
            style={[styles.qualifications, { color: theme.textSecondary }]}
            numberOfLines={1}
          >
            {doctor.qualifications}
          </Text>
          <Text style={[styles.specialty, { color: theme.primary }]}>
            {specialty}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <StatusBadge status={doctor.todayAvailability} size="sm" />
        <VerifiedBadge
          date={doctor.lastVerifiedAt}
          isStale={doctor.verificationStatus === 'unverified'}
          isPending={doctor.verificationStatus === 'pending'}
          canCall={Boolean(callNumber)}
        />
      </View>

      {primaryPractice && (
        <View
          style={[
            styles.chamberBox,
            {
              backgroundColor: isDark ? theme.surfaceVariant : theme.background,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.chamberHeader}>
            <Text
              style={[styles.chamberName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {primaryPractice.establishmentName}
            </Text>
            {primaryPractice.distanceKm !== undefined && (
              <Text
                style={[
                  styles.distanceBadge,
                  {
                    backgroundColor: theme.primaryLight,
                    color: theme.primaryDark,
                  },
                ]}
              >
                {primaryPractice.distanceKm} km
              </Text>
            )}
          </View>

          {primarySchedule && (
            <View style={styles.scheduleRow}>
              <Clock size={12} color={theme.textSecondary} />
              <Text
                style={[styles.scheduleText, { color: theme.textSecondary }]}
              >
                {language === 'bn' ? primarySchedule.dayNameBn : primarySchedule.dayName} ·{' '}
                {language === 'bn' ? primarySchedule.slotLabelBn : primarySchedule.slotLabel}
              </Text>
            </View>
          )}

          <View style={styles.tokenRow}>
            <Ticket size={11} color={theme.warning} />
            <Text style={[styles.tokenText, { color: theme.warningText }]}>
              {tokenText}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionStrip}>
        <TouchableOpacity
          style={[
            styles.planButton,
            {
              backgroundColor: isDark ? theme.surfaceVariant : theme.background,
              borderColor: theme.border,
            },
          ]}
          activeOpacity={0.7}
          onPress={handlePlanVisit}
        >
          <CalendarPlus size={15} color={theme.textSecondary} />
          <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.planButtonText, { color: theme.textSecondary }]}>
            {t('common.planVisit')}
          </Text>
        </TouchableOpacity>

        {primaryPractice?.hasExactLocation ? (
          <TouchableOpacity
            style={[
              styles.directionsButton,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleDirections}
          >
            <Navigation size={14} color={theme.primaryDark} />
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              style={[styles.directionsButtonText, { color: theme.primaryDark }]}
            >
              {t('common.directions')}
            </Text>
          </TouchableOpacity>
        ) : null}

        {callNumber ? (
          <TouchableOpacity
            style={[styles.callButton, { backgroundColor: theme.primary }]}
            activeOpacity={0.8}
            onPress={handleCall}
          >
            <Phone size={14} color={theme.textInverse} />
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={[styles.callButtonText, { color: theme.textInverse }]}>
              {t('common.call')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

export const DoctorCard = React.memo(DoctorCardView);

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoCol: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  shareBtn: {
    padding: 4,
  },
  qualifications: {
    fontSize: 12,
    marginTop: 1,
  },
  specialty: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  chamberBox: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
    marginTop: 12,
  },
  chamberHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chamberName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  distanceBadge: {
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  scheduleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tokenText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actionStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  planButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  planButtonText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  directionsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  directionsButtonText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  callButton: {
    flex: 1.15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  callButtonText: {
    flexShrink: 1,
    fontSize: 13,
    fontWeight: '700',
  },
});
