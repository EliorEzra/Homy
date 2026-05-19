import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { spacing } from "@/theme/theme";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
type BadgeSize = "sm" | "md";

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  primary:   { bg: "#fff0e8", text: "#ff5c02" },
  secondary: { bg: "#ede8ff", text: "#4d00ff" },
  success:   { bg: "#e8f9f0", text: "#1fc16b" },
  warning:   { bg: "#fff9e0", text: "#dfb400" },
  error:     { bg: "#ffe8ea", text: "#d00416" },
  neutral:   { bg: "#f0f0f0", text: "#777777" },
};

export type ThemedBadgeProps = {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: StyleProp<ViewStyle>;
};

export function ThemedBadge({ label, variant = "primary", size = "md", style }: ThemedBadgeProps) {
  const colors = VARIANT_COLORS[variant];
  return (
    <View style={[styles.badge, size === "sm" && styles.badgeSm, { backgroundColor: colors.bg }, style]}>
      <ThemedText style={[styles.text, size === "sm" && styles.textSm, { color: colors.text }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: 20 },
  badgeSm: { paddingHorizontal: spacing.xs, paddingVertical: 2 },
  text: { fontSize: 13, fontWeight: '600' },
  textSm: { fontSize: 11 },
});
