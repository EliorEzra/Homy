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

export type ThemedEmptyStateProps = ViewProps & {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ThemedEmptyState({
  title,
  description,
  icon,
  action,
  lightColor,
  darkColor,
  style,
  ...rest
}: ThemedEmptyStateProps) {
  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const secondaryTextColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'tabIconDefault'
  );

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
      {...rest}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <Text style={[styles.title, { color: textColor }, typography.heading.h3]}>
        {title}
      </Text>
      {description && (
        <Text style={[styles.description, { color: secondaryTextColor }]}>
          {description}
        </Text>
      )}
      {action && (
        <View style={styles.actionContainer}>
          {action}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    marginBottom: spacing.md,
    opacity: 0.6,
  },
  title: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    marginBottom: spacing.lg,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});
