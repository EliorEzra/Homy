import React from "react";
import {
  View,
  Text,
  ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedCard } from "./themed-card";

export type StatCardProps = ViewProps & {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "neutral";
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function StatCard({
  label,
  value,
  icon,
  variant = "primary",
  lightColor,
  darkColor,
  style,
  ...rest
}: StatCardProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const secondaryColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'tabIconDefault'
  );

  return (
    <ThemedCard
      variant="elevated"
      style={[
        styles.card,
        style,
      ]}
      {...rest}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={[styles.value, { color: textColor }, typography.heading.h2]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: secondaryColor }]}>
        {label}
      </Text>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    flex: 1,
  },
  iconContainer: {
    marginBottom: spacing.sm,
    opacity: 0.8,
  },
  value: {
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  label: {
    ...typography.label.md,
    textAlign: 'center',
  },
});
