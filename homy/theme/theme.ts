/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';
import { darkModePalette, lightModePalette } from './palette';
import { typography } from './typography';
import { spacing } from './spacing';

export { typography, spacing }

// Change the rest to use the palettes
export const Colors = {
  light: {
    text: '#11181C',
    background: lightModePalette.surface,
    icon: lightModePalette.primary[200],
    tabIconDefault: lightModePalette.neutral[600],
    inputBorderSelected: lightModePalette.secondary.DEFAULT,
    inputBorder: "#999a9b",
    inputBackground: '#b9bbbd',
    buttonBackground: lightModePalette.primary.DEFAULT,
    buttonTextColor: lightModePalette.neutral[100],
    disabledButtonBackground: lightModePalette.neutral[300],
    disabledButtonTextColor: lightModePalette.neutral[600],
  },
  dark: {
    text: darkModePalette.onSurface,
    background: darkModePalette.surface,
    icon: darkModePalette.primary[200],
    tabIconDefault: darkModePalette.neutral[700],
    inputBorderSelected: darkModePalette.secondary.DEFAULT,
    inputBorder: darkModePalette.neutral[600],
    inputBackground: darkModePalette.neutral[300],
    buttonBackground: darkModePalette.primary.DEFAULT,
    buttonTextColor: darkModePalette.neutral[100],
    disabledButtonBackground: darkModePalette.neutral[400],
    disabledButtonTextColor: darkModePalette.neutral[700],
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
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
