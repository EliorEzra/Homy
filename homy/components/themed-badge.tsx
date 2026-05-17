import React from "react";
import {
  View,
  Text,
  ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
  type TextStyle,
} from "react-native";
import { typography, spacing } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedBadgeProps = ViewProps & {
  label: string;
  variant?: "primary" | "secondary" | "success" | "error" | "warning";
  size?: "sm" | "md";
  lightColor?: string;
  darkColor?: string;
  textStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
}

export function ThemedBadge({
  label,
  variant = "primary",
  size = "sm",
  lightColor,
  darkColor,
  textStyle,
  style,
  ...rest
}: ThemedBadgeProps) {
  const getBackgroundColor = () => {
    if (lightColor || darkColor) {
      return useThemeColor({ light: lightColor, dark: darkColor }, 'buttonBackground');
    }
    switch (variant) {
      case 'secondary':
        return useThemeColor({}, 'icon');
      case 'success':
        return useThemeColor({}, 'buttonBackground');
      case 'error':
        return '#ff3748';
      case 'warning':
        return '#ffdb43';
      default:
        return useThemeColor({}, 'buttonBackground');
    }
  };

  const backgroundColor = getBackgroundColor();
  const fontSize = size === 'sm' ? 12 : 14;
  const paddingVertical = size === 'sm' ? spacing.xs : spacing.sm;
  const paddingHorizontal = size === 'sm' ? spacing.sm : spacing.md;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingVertical,
          paddingHorizontal,
        },
        style,
      ]}
      {...rest}
    >
      <Text style={[styles.text, { fontSize }, textStyle]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
    fontWeight: '600',
    lineHeight: 18,
  },
});
