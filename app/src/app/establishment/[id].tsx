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
  Building2,
  MapPin,
  Clock,
  Phone,
  Navigation,
  Share2,
  CheckCircle2,
  Stethoscope,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import { ESTABLISHMENTS, DOCTORS } from '../../data/mockData';
import { Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { VerifiedBadge } from '../../components/common/VerifiedBadge';

export default function EstablishmentProfileScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language } = useApp();

  const establishment = ESTABLISHMENTS.find((e) => e.id === id) || ESTABLISHMENTS[0];

  const name = language === 'bn' && establishment.nameBn ? establishment.nameBn : establishment.name;
  const description = language === 'bn' && establishment.descriptionBn
    ? establishment.descriptionBn
    : establishment.description;
  const hours = language === 'bn' && establishment.openingHoursBn
    ? establishment.openingHoursBn
    : establishment.openingHours;

  const handleCall = (phoneNumber: string) => {
    if (phoneNumber) {
      Linking.openURL(`tel:${phoneNumber.replace(/\s+/g, '')}`);
    }
  };

  const handleDirections = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${establishment.latitude},${establishment.longitude}`;
    Linking.openURL(url);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${establishment.name} - Address & Visiting Doctor Schedules on DocTimings app.`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => router.back()}
        >
          <ArrowLeft size={20} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Establishment Profile</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={handleShare}>
          <Share2 size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.typeBadge}>
            <Building2 size={14} color={Colors.primaryDark} />
            <Text style={styles.typeBadgeText}>
              {establishment.type === 'pharmacy'
                ? t('establishment.typePharmacy')
                : t('establishment.typeClinic')}
            </Text>
          </View>

          <Text style={styles.name}>{name}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.verifiedRow}>
            <VerifiedBadge date={establishment.lastVerifiedAt} />
          </View>

          <View style={styles.infoBox}>
            <View style={styles.infoRow}>
              <MapPin size={15} color={Colors.primary} />
              <Text style={styles.infoText}>
                {establishment.addressLine}, {establishment.locality} · PIN {establishment.pincode}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Clock size={15} color={Colors.primary} />
              <Text style={styles.infoText}>{hours}</Text>
            </View>

            <View style={styles.infoRow}>
              <Phone size={15} color={Colors.primary} />
              <Text style={styles.infoText}>
                {establishment.phone}
                {establishment.secondaryPhone ? ` / ${establishment.secondaryPhone}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.dirBtn}
              activeOpacity={0.8}
              onPress={handleDirections}
            >
              <Navigation size={14} color={Colors.primary} />
              <Text style={styles.dirBtnText}>{t('common.directions')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callBtn}
              activeOpacity={0.8}
              onPress={() => handleCall(establishment.phone)}
            >
              <Phone size={14} color={Colors.textInverse} />
              <Text style={styles.callBtnText}>{t('common.call')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.noticeBox}>
          <Info size={16} color={Colors.primaryDark} />
          <Text style={styles.noticeText}>
            {t('establishment.callCounterNotice')}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('establishment.visitingDoctors', {
              count: establishment.visitingDoctors.length,
            })}
          </Text>

          {establishment.visitingDoctors.map((docItem) => {
            const docName = language === 'bn' && docItem.doctorNameBn
              ? docItem.doctorNameBn
              : docItem.doctorName;
            const docSpecialty = language === 'bn' && docItem.specialtyBn
              ? docItem.specialtyBn
              : docItem.specialty;

            return (
              <TouchableOpacity
                key={docItem.doctorId}
                style={styles.doctorItemCard}
                activeOpacity={0.8}
                onPress={() => router.push(`/doctor/${docItem.doctorId}`)}
              >
                <View style={styles.docItemTop}>
                  <View style={styles.docAvatar}>
                    <Text style={styles.docAvatarText}>
                      {docItem.doctorName.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.docItemInfo}>
                    <Text style={styles.docItemName}>{docName}</Text>
                    <Text style={styles.docItemSpecialty}>{docSpecialty}</Text>
                    <Text style={styles.docItemFee}>Fee: ₹{docItem.fee}</Text>
                  </View>
                  <ChevronRight size={18} color={Colors.textMuted} />
                </View>

                <View style={styles.docItemStatus}>
                  <StatusBadge status={docItem.todayAvailability} size="sm" />
                  {docItem.schedules[0] && (
                    <Text style={styles.docItemSchedule}>
                      {docItem.schedules[0].dayName} · {docItem.schedules[0].slotLabel}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
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
    color: Colors.textPrimary,
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
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    lineHeight: 18,
  },
  verifiedRow: {
    marginTop: 10,
  },
  infoBox: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  dirBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dirBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  callBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  callBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textInverse,
  },
  noticeBox: {
    margin: 16,
    padding: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: Colors.primaryDark,
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  doctorItemCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    marginBottom: 10,
  },
  docItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryDark,
  },
  docItemInfo: {
    flex: 1,
  },
  docItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  docItemSpecialty: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  docItemFee: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  docItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  docItemSchedule: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
