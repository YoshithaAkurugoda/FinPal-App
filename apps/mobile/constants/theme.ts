export const theme = {
  colors: {
    primary: '#00D4B1',
    primaryDark: '#00A896',
    background: '#070C18',
    surface: '#0D1829',
    surfaceLight: '#1A2B40',
    surfaceMid: '#111F36',
    text: '#FFFFFF',
    textSecondary: '#6B7A90',
    success: '#00D4B1',
    warning: '#F59E0B',
    danger: '#EF4444',
    accent: '#00D4B1',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    full: 100,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 42,
  },
} as const;

export type Theme = typeof theme;
