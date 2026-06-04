import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { spacing } from "@/theme/theme";

type BadgeVariant = "primary" | "secondary" | "success" | "warning" | "error" | "neutral";
type BadgeSize = "sm" | "md";

const VARIANT_COLORS: Record<BadgeVariant, { bg: string; text: string }> = {
  primary:   { bg: "#ddeef5", text: "#106d8f" },
  secondary: { bg: "#e8f4f9", text: "#61b2cf" },
  success:   { bg: "#e8f9f0", text: "#1fc16b" },
  warning:   { bg: "#fff9e0", text: "#dfb400" },
  error:     { bg: "#ffe8ea", text: "#e03040" },
  neutral:   { bg: "#edf0f4", text: "#686c70" },
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
