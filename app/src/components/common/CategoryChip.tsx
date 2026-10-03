import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useApp } from '../../store/AppContext';

interface CategoryChipProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  label,
  selected = false,
  onPress,
  icon,
}) => {
  const { theme } = useApp();

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primaryLight : theme.surface,
          borderColor: selected ? theme.primary : theme.border,
        },
      ]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text
        style={[
          styles.text,
          {
            color: selected ? theme.primaryDark : theme.textSecondary,
            fontWeight: selected ? '700' : '500',
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 9999,
    borderWidth: 1,
    minHeight: 38,
  },
  iconContainer: {
    marginRight: 6,
  },
  text: {
    fontSize: 13,
  },
});
