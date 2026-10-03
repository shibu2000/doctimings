export const Colors = {
  primary: '#0F766E',
  primaryDark: '#115E59',
  primaryLight: '#CCFBF1',
  primaryMuted: '#E6F7F5',

  success: '#16A34A',
  successLight: '#DCFCE7',
  successText: '#15803D',

  warning: '#D97706',
  warningLight: '#FEF3C7',
  warningText: '#B45309',

  error: '#DC2626',
  errorLight: '#FEE2E2',
  errorText: '#B91C1C',

  info: '#2563EB',
  infoLight: '#DBEAFE',

  statusUnknown: '#64748B',
  statusUnknownLight: '#F1F5F9',

  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
  surfaceContainer: '#F1F5F9',
  surfaceContainerLow: '#F8FAFC',
  surfaceContainerHigh: '#E2E8F0',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  border: '#E2E8F0',
  borderDark: '#CBD5E1',

  glowPrimary: 'rgba(15, 118, 110, 0.25)',
  glowSuccess: 'rgba(22, 163, 74, 0.28)',
  glowWarning: 'rgba(217, 119, 6, 0.25)',
  backdrop: 'rgba(15, 23, 42, 0.45)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Typography = {
  h1: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    color: Colors.textPrimary,
  },
  h2: {
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: Colors.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 26,
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
    color: Colors.textPrimary,
  },
  bodyLg: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: Colors.textPrimary,
  },
  bodyMd: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: Colors.textPrimary,
  },
  bodySm: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 18,
    color: Colors.textSecondary,
  },
  labelLg: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  labelMd: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
  },
  labelSm: {
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
} as const;
