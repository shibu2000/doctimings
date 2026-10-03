export const LightColors = {
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

export const DarkColors = {
  primary: '#14B8A6',
  primaryDark: '#0D9488',
  primaryLight: '#134E4A',
  primaryMuted: '#0F3835',

  success: '#22C55E',
  successLight: '#14532D',
  successText: '#4ADE80',

  warning: '#F59E0B',
  warningLight: '#78350F',
  warningText: '#FDE68A',

  error: '#EF4444',
  errorLight: '#7F1D1D',
  errorText: '#FCA5A5',

  info: '#3B82F6',
  infoLight: '#1E3A8A',

  statusUnknown: '#94A3B8',
  statusUnknownLight: '#334155',

  background: '#0B1120',
  surface: '#1E293B',
  surfaceVariant: '#293548',

  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0B1120',

  border: '#334155',
  borderDark: '#475569',

  glowPrimary: 'rgba(20, 184, 166, 0.35)',
  glowSuccess: 'rgba(34, 197, 94, 0.35)',
  glowWarning: 'rgba(245, 158, 11, 0.35)',

  backdrop: 'rgba(0, 0, 0, 0.75)',
} as const;

export type ThemeColors = Record<keyof typeof LightColors, string>;

export const Colors = LightColors;

export const getThemeColors = (isDark: boolean): ThemeColors => {
  return isDark ? DarkColors : LightColors;
};

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
    lineHeight: 24,
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
  },
} as const;
