import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Navigation } from 'lucide-react-native';
import { Doctor } from '../../types';
import { SearchTown } from '../../services/api';
import { useApp } from '../../store/AppContext';
import { DoctorCard } from './DoctorCard';

interface DoctorResultsProps {
  doctors: Doctor[];
  town: SearchTown | null;
}

export const DoctorResults: React.FC<DoctorResultsProps> = ({ doctors, town }) => {
  const { t } = useTranslation();
  const { theme } = useApp();

  const SectionLabel = ({ text, icon }: { text: string; icon: 'pin' | 'nav' }) => (
    <View style={styles.sectionLabel}>
      {icon === 'pin' ? <MapPin size={13} color={theme.primary} /> : <Navigation size={13} color={theme.textSecondary} />}
      <Text style={[styles.sectionLabelText, { color: icon === 'pin' ? theme.primaryDark : theme.textSecondary }]}>
        {text}
      </Text>
    </View>
  );

  if (!town) {
    return (
      <View style={styles.list}>
        <SectionLabel text={t('search.sortedNearest')} icon="nav" />
        {doctors.map((doc) => (
          <DoctorCard key={doc.id} doctor={doc} />
        ))}
      </View>
    );
  }

  const inTown = doctors.filter((d) => d.inTown);
  const outside = doctors.filter((d) => !d.inTown);

  return (
    <View style={styles.list}>
      {town.doctorCount === 0 ? (
        <View style={[styles.notice, { backgroundColor: theme.warningLight }]}>
          <Text style={[styles.noticeText, { color: theme.warningText }]}>
            {t('search.noneInTown', { town: town.name })}
          </Text>
        </View>
      ) : null}
      {inTown.length > 0 && <SectionLabel text={t('search.inTown', { town: town.name })} icon="pin" />}
      {inTown.map((doc) => (
        <DoctorCard key={doc.id} doctor={doc} />
      ))}
      {outside.length > 0 && (
        <SectionLabel
          text={town.doctorCount === 0 ? t('search.sortedNearest') : t('search.outsideTown', { town: town.name })}
          icon="nav"
        />
      )}
      {outside.map((doc) => (
        <DoctorCard key={doc.id} doctor={doc} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  notice: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 17,
  },
});
