import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Primary Brand Colors (Purples)
    primary: '#8b5cf6',       // Violet 500
    primaryLight: '#c084fc',  // Violet 400
    primaryDark: '#6d28d9',   // Violet 700
    primarySoft: '#faf5ff',   // Violet 50

    // Secondary/Accent Colors (Pinks & Blues)
    accentPink: '#ec4899',    // Pink 500
    accentPinkSoft: '#fbcfe8',// Pink 200
    accentPinkDark: '#db2777',// Pink 600

    accentBlue: '#60a5fa',    // Blue 400
    accentBlueSoft: '#e0f2fe',// Blue 100
    accentBlueDark: '#2563eb',// Blue 600

    // Semantic Status Colors
    success: '#22c55e',       // Green 500 (Stable/Present)
    successSoft: '#dcfce7',   // Green 100
    successDark: '#16a34a',   // Green 600

    warning: '#f59e0b',       // Amber 500 (Caution)
    warningSoft: '#fef3c7',   // Amber 100
    warningDark: '#d97706',   // Amber 600

    danger: '#ef4444',        // Red 500 (Risk)
    dangerSoft: '#fee2e2',    // Red 100
    dangerDark: '#dc2626',    // Red 600

    // UI Neutrals
    text: '#1e293b',          // Slate 800
    textSecondary: '#64748b', // Slate 500
    textMuted: '#94a3b8',     // Slate 400
    
    background: '#ffffff',
    backgroundElement: '#f8fafc', // Slate 50
    backgroundSelected: '#f1f5f9',// Slate 100
    border: '#e2e8f0',            // Slate 200
    card: '#ffffff',
  },
  dark: {
    // Dark Theme equivalents
    primary: '#a78bfa',
    primaryLight: '#c084fc',
    primaryDark: '#7c3aed',
    primarySoft: '#2e1065',

    accentPink: '#f472b6',
    accentPinkSoft: '#831843',
    accentPinkDark: '#be185d',

    accentBlue: '#93c5fd',
    accentBlueSoft: '#1e3a8a',
    accentBlueDark: '#1d4ed8',

    success: '#4ade80',
    successSoft: '#064e3b',
    successDark: '#15803d',

    warning: '#fbbf24',
    warningSoft: '#78350f',
    warningDark: '#b45309',

    danger: '#f87171',
    dangerSoft: '#7f1d1d',
    dangerDark: '#b91c1c',

    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    background: '#0f172a',        // Slate 900
    backgroundElement: '#1e293b', // Slate 800
    backgroundSelected: '#334155',// Slate 700
    border: '#334155',
    card: '#1e293b',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    rounded: 'System', // fallbacks internally on iOS
    mono: 'Courier New',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif-condensed',
    mono: 'monospace',
  },
  default: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
