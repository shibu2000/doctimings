import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Clock, HelpCircle, XCircle } from 'lucide-react-native';
import { AvailabilityStatus } from '../../types';
import { useApp } from '../../store/AppContext';
import { GlowingIcon } from './GlowingIcon';

interface StatusBadgeProps {
  status: AvailabilityStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useTranslation();
  const { theme } = useApp();

  const getConfig = () => {
    switch (status) {
      case 'available_today':
        return {
          label: t('status.availableToday'),
          bgColor: theme.successLight,
          textColor: theme.successText,
          iconColor: theme.success,
          glowColor: theme.glowSuccess,
          Icon: CheckCircle2,
          isGlowing: true,
        };
      case 'scheduled_today':
        return {
          label: t('status.scheduledToday'),
          bgColor: theme.warningLight,
          textColor: theme.warningText,
          iconColor: theme.warning,
          glowColor: theme.glowWarning,
          Icon: Clock,
          isGlowing: false,
        };
      case 'not_available':
        return {
          label: t('status.notAvailableToday'),
          bgColor: theme.errorLight,
          textColor: theme.errorText,
          iconColor: theme.error,
          glowColor: theme.error,
          Icon: XCircle,
          isGlowing: false,
        };
      case 'unknown':
      default:
        return {
          label: t('status.availabilityUnknown'),
          bgColor: theme.statusUnknownLight,
          textColor: theme.statusUnknown,
          iconColor: theme.statusUnknown,
          glowColor: theme.statusUnknown,
          Icon: HelpCircle,
          isGlowing: false,
        };
    }
  };

  const { label, bgColor, textColor, iconColor, glowColor, Icon, isGlowing } = getConfig();
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }, size === 'sm' && styles.badgeSm]}>
      {isGlowing ? (
        <GlowingIcon glowColor={glowColor} size={iconSize + 4} pulse={false}>
          <Icon size={iconSize} color={iconColor} strokeWidth={2.5} />
        </GlowingIcon>
      ) : (
        <Icon size={iconSize} color={iconColor} strokeWidth={2.2} />
      )}
      <Text style={[styles.text, { color: textColor }, size === 'sm' && styles.textSm]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 5,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
  textSm: {
    fontSize: 11,
  },
});
