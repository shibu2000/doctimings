import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backLabel?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  backLabel,
  onBack,
  rightAction,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={styles.leftContainer}>
          {showBack && (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <ArrowLeft size={20} color={Colors.primary} />
              {backLabel && <Text style={styles.backLabel}>{backLabel}</Text>}
            </TouchableOpacity>
          )}
          <Text style={[styles.title, showBack && !backLabel && styles.titleWithBack]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {rightAction && <View style={styles.rightContainer}>{rightAction}</View>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  leftContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.sm,
    marginRight: Spacing.xs,
  },
  backLabel: {
    ...Typography.labelMd,
    color: Colors.primary,
    marginLeft: Spacing.xs,
    maxWidth: 120,
  },
  title: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flexShrink: 1,
  },
  titleWithBack: {
    marginLeft: Spacing.xs,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  subtitle: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    marginTop: 4,
  },
});
