import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Compass } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface RadiusSelectorProps {
  currentRadius: number;
  onSelectRadius: (radius: number) => void;
}

export const RadiusSelector: React.FC<RadiusSelectorProps> = ({
  currentRadius,
  onSelectRadius,
}) => {
  const { t } = useTranslation();
  const radiusOptions = [5, 15, 25, 50];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Compass size={14} color={Colors.primary} />
        <Text style={styles.title}>{t('search.filterDistance')}</Text>
      </View>
      <View style={styles.optionsRow}>
        {radiusOptions.map((radius) => {
          const isSelected = currentRadius === radius;
          return (
            <TouchableOpacity
              key={radius}
              style={[styles.chip, isSelected && styles.chipActive]}
              activeOpacity={0.7}
              onPress={() => onSelectRadius(radius)}
            >
              <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                {radius} km
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipTextActive: {
    fontWeight: '700',
    color: Colors.primaryDark,
  },
});
