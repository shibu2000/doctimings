import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, AlertTriangle } from 'lucide-react-native';
import { useApp } from '../../store/AppContext';
import { GlowingIcon } from './GlowingIcon';

interface VerifiedBadgeProps {
  date?: string;
  isStale?: boolean;
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ date, isStale = false }) => {
  const { theme } = useApp();

  if (isStale) {
    return (
      <View style={[styles.staleContainer, { backgroundColor: theme.warningLight }]}>
        <AlertTriangle size={12} color={theme.warning} strokeWidth={2.5} />
        <Text style={[styles.staleText, { color: theme.warningText }]}>
          Schedule may have changed · Call counter
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GlowingIcon glowColor={theme.glowPrimary} size={18} pulse>
        <View style={[styles.checkCircle, { backgroundColor: theme.primary }]}>
          <Check size={10} color={theme.textInverse} strokeWidth={3} />
        </View>
      </GlowingIcon>
      <Text style={[styles.text, { color: theme.primaryDark }]}>
        Verified recently{date ? ` · ${date}` : ''}
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
