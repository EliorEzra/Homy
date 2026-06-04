import React from "react";
import { View, ViewProps, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { spacing } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedCardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: "default" | "elevated" | "outlined";
  style?: StyleProp<ViewStyle>;
}

export function ThemedCard({ style, lightColor, darkColor, variant = "default", children, ...rest }: ThemedCardProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'cardBackground');
  return (
    <View
      style={[styles.container, variant === "elevated" && styles.elevated, variant === "outlined" && styles.outlined, { backgroundColor }, style]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.md, paddingHorizontal: spacing.md, borderRadius: 12, marginVertical: spacing.sm },
  elevated: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3 },
  outlined: { borderWidth: 1, borderColor: '#ccc' },
});
