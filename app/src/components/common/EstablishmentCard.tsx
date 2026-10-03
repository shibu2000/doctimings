import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Building2, MapPin, Clock, Phone, Stethoscope } from 'lucide-react-native';
import { Establishment } from '../../types';
import { Colors } from '../../constants/theme';
import { useApp } from '../../store/AppContext';
import { VerifiedBadge } from './VerifiedBadge';

interface EstablishmentCardProps {
  establishment: Establishment;
}

export const EstablishmentCard: React.FC<EstablishmentCardProps> = ({ establishment }) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useApp();

  const name = language === 'bn' && establishment.nameBn ? establishment.nameBn : establishment.name;
  const hours = language === 'bn' && establishment.openingHoursBn ? establishment.openingHoursBn : establishment.openingHours;

  const handleCall = () => {
    if (establishment.phone) {
      Linking.openURL(`tel:${establishment.phone.replace(/\s+/g, '')}`);
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => router.push(`/establishment/${establishment.id}`)}
    >
      <View style={styles.header}>
        <View style={styles.iconBox}>
          <Building2 size={20} color={Colors.primary} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.type}>
            {establishment.type === 'pharmacy' ? t('establishment.typePharmacy') : t('establishment.typeClinic')}
          </Text>
        </View>
      </View>

      <View style={styles.detailRow}>
        <MapPin size={13} color={Colors.textSecondary} />
        <Text style={styles.detailText} numberOfLines={1}>
          {establishment.addressLine}, {establishment.locality}
        </Text>
      </View>

      <View style={styles.detailRow}>
        <Clock size={13} color={Colors.textSecondary} />
        <Text style={styles.detailText}>{hours}</Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.doctorsBadge}>
          <Stethoscope size={13} color={Colors.primaryDark} />
          <Text style={styles.doctorsText}>
            {t('establishment.visitingDoctors', { count: establishment.visitingDoctors.length })}
          </Text>
        </View>
        <VerifiedBadge date={establishment.lastVerifiedAt} />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.profileBtn}
          activeOpacity={0.7}
          onPress={() => router.push(`/establishment/${establishment.id}`)}
        >
          <Text style={styles.profileBtnText}>{t('common.viewProfile')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.callBtn}
          activeOpacity={0.8}
          onPress={handleCall}
        >
          <Phone size={13} color={Colors.primaryDark} />
          <Text style={styles.callBtnText}>{t('common.call')}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  type: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  detailText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexWrap: 'wrap',
    gap: 6,
  },
  doctorsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doctorsText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  profileBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  callBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primaryDark,
  },
});
