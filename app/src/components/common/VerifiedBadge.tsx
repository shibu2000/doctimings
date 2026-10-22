import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Check, AlertTriangle } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';

const formatVerifiedDate = (value: Date, locale: string) => {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: '2-digit' })
      .formatToParts(value)
      .map((part) => [part.type, part.value])
  );
  return `${parts.day} ${parts.month}, ${parts.year}`;
};

interface VerifiedBadgeProps {
  date?: string;
  isStale?: boolean;
  isPending?: boolean;
  canCall?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ date, isStale = false, isPending = false, canCall = false }) => {
  const { t } = useTranslation();
  const { theme, language } = useApp();

  const verifiedLabel = () => {
    const verified = date ? new Date(date) : null;
    if (!verified || Number.isNaN(verified.getTime())) return t('common.verifiedRecently');
    return t('common.verifiedOn', { date: formatVerifiedDate(verified, language === 'bn' ? 'bn-IN' : 'en-IN') });
  };

  if (isStale || isPending) {
    return (
      <View style={[styles.staleContainer, { backgroundColor: theme.warningLight }]}>
        <AlertTriangle size={12} color={theme.warning} strokeWidth={2.5} />
        <Text style={[styles.staleText, { color: theme.warningText }]}>
          {isPending ? t(canCall ? 'common.notVerifiedCall' : 'common.notVerified') : t('common.verifiedStale')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
        <Check size={10} color={theme.textInverse} strokeWidth={3} />
      </View>
      <Text style={[styles.text, { color: theme.primaryDark }]}>
        {verifiedLabel()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  checkCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '500',
  },
  staleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  staleText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
