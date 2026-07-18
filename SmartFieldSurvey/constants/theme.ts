import { Platform } from 'react-native';

const tintColorLight = '#2563EB';
const tintColorDark = '#60A5FA';

export const Colors = {
  light: {
    text: '#1E293B',
    textSecondary: '#64748B',
    background: '#F1F5F9',
    surface: '#FFFFFF',
    tint: tintColorLight,
    icon: '#64748B',
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    border: '#E2E8F0',
    primary: '#2563EB',
    primaryLight: '#DBEAFE',
    secondary: '#10B981',
    secondaryLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    accent: '#8B5CF6',
    accentLight: '#EDE9FE',
  },
  dark: {
    text: '#F1F5F9',
    textSecondary: '#94A3B8',
    background: '#0F172A',
    surface: '#1E293B',
    tint: tintColorDark,
    icon: '#94A3B8',
    tabIconDefault: '#64748B',
    tabIconSelected: tintColorDark,
    border: '#334155',
    primary: '#60A5FA',
    primaryLight: '#1E3A5F',
    secondary: '#34D399',
    secondaryLight: '#064E3B',
    warning: '#FBBF24',
    warningLight: '#78350F',
    danger: '#F87171',
    dangerLight: '#7F1D1D',
    accent: '#A78BFA',
    accentLight: '#3B0764',
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
