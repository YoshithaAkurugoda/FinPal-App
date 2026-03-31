export const theme = {
  colors: {
    primary: '#0EA5E9',
    primaryDark: '#0284C7',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceLight: '#334155',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    accent: '#8B5CF6',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
} as const;

export type Theme = typeof theme;
