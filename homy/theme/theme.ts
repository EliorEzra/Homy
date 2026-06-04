import { darkModePalette, lightModePalette } from './palette';
import { typography } from './typography';
import { spacing, radius, shadows } from './spacing';

export { typography, spacing, radius, shadows }

export const Colors = {
  light: {
    text: '#1c1e20',
    background: '#e2e8f0',
    icon: lightModePalette.primary[200],
    tabIconDefault: lightModePalette.neutral[600],
    inputBorderSelected: lightModePalette.primary.DEFAULT,
    inputBorder: '#c8cfd8',
    inputBackground: '#edf1f7',
    buttonBackground: lightModePalette.primary.DEFAULT,
    buttonTextColor: '#ffffff',
    disabledButtonBackground: lightModePalette.neutral[300],
    disabledButtonTextColor: lightModePalette.neutral[600],
    cardBackground: '#ffffff',
  },
  dark: {
    text: '#f0f2f4',
    background: '#111416',
    icon: darkModePalette.primary[200],
    tabIconDefault: darkModePalette.neutral[600],
    inputBorderSelected: darkModePalette.primary.DEFAULT,
    inputBorder: '#2e3234',
    inputBackground: '#0e1117',
    buttonBackground: darkModePalette.primary.DEFAULT,
    buttonTextColor: '#ffffff',
    disabledButtonBackground: darkModePalette.neutral[300],
    disabledButtonTextColor: darkModePalette.neutral[600],
    cardBackground: '#1a1e20',
  },
};
