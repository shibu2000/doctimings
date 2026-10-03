import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Clock, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/theme';
import { AvailabilityStatus } from '../types';

interface StatusBadgeProps {
  status: AvailabilityStatus | 'verified' | 'active' | 'pending' | 'urgent';
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'sm' }) => {
  const isSmall = size === 'sm';

  switch (status) {
    case 'available_today':
      return (
        <View style={[styles.badge, styles.successBadge, isSmall && styles.badgeSm]}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={[styles.text, styles.successText, isSmall && styles.textSm]}>
            {label || 'Available today'}
          </Text>
        </View>
      );

    case 'scheduled_today':
      return (
        <View style={[styles.badge, styles.warningBadge, isSmall && styles.badgeSm]}>
          <Clock size={isSmall ? 12 : 14} color={Colors.warningText} />
          <Text style={[styles.text, styles.warningText, isSmall && styles.textSm]}>
            {label || 'Scheduled today'}
          </Text>
        </View>
      );

    case 'delayed':
      return (
        <View style={[styles.badge, styles.warningBadge, isSmall && styles.badgeSm]}>
          <AlertTriangle size={isSmall ? 12 : 14} color={Colors.warningText} />
          <Text style={[styles.text, styles.warningText, isSmall && styles.textSm]}>
            {label || 'Delayed'}
          </Text>
        </View>
      );

    case 'not_available':
      return (
        <View style={[styles.badge, styles.errorBadge, isSmall && styles.badgeSm]}>
          <XCircle size={isSmall ? 12 : 14} color={Colors.errorText} />
          <Text style={[styles.text, styles.errorText, isSmall && styles.textSm]}>
            {label || 'Not available today'}
          </Text>
        </View>
      );

    case 'verified':
      return (
        <View style={[styles.badge, styles.successBadge, isSmall && styles.badgeSm]}>
          <ShieldCheck size={isSmall ? 12 : 14} color={Colors.successText} />
          <Text style={[styles.text, styles.successText, isSmall && styles.textSm]}>
            {label || 'Verified'}
          </Text>
        </View>
      );

    case 'active':
      return (
        <View style={[styles.badge, styles.successBadge, isSmall && styles.badgeSm]}>
          <View style={[styles.dot, { backgroundColor: Colors.success }]} />
          <Text style={[styles.text, styles.successText, isSmall && styles.textSm]}>
            {label || 'Active'}
          </Text>
        </View>
      );

    case 'urgent':
      return (
        <View style={[styles.badge, styles.errorBadge, isSmall && styles.badgeSm]}>
          <AlertTriangle size={isSmall ? 12 : 14} color={Colors.errorText} />
          <Text style={[styles.text, styles.errorText, isSmall && styles.textSm]}>
            {label || 'Urgent'}
          </Text>
        </View>
      );

    default:
      return (
        <View style={[styles.badge, styles.neutralBadge, isSmall && styles.badgeSm]}>
          <View style={[styles.dot, { backgroundColor: Colors.statusUnknown }]} />
          <Text style={[styles.text, styles.neutralText, isSmall && styles.textSm]}>
            {label || 'Unknown'}
          </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    ...Typography.labelMd,
    fontSize: 12,
  },
  textSm: {
    fontSize: 11,
    lineHeight: 14,
  },
  successBadge: {
    backgroundColor: Colors.successLight,
  },
  successText: {
    color: Colors.successText,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: Colors.warningLight,
  },
  warningText: {
    color: Colors.warningText,
    fontWeight: '600',
  },
  errorBadge: {
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    color: Colors.errorText,
    fontWeight: '600',
  },
  neutralBadge: {
    backgroundColor: Colors.surfaceVariant,
  },
  neutralText: {
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
