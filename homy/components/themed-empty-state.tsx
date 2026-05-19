import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { spacing } from "@/theme/theme";

export type ThemedEmptyStateProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ThemedEmptyState({ title, description, icon, action, style }: ThemedEmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <ThemedText type="defaultSemiBold" style={styles.title}>{title}</ThemedText>
      {description && <ThemedText style={styles.description}>{description}</ThemedText>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xl * 2, paddingHorizontal: spacing.lg },
  icon: { marginBottom: spacing.md },
  title: { fontSize: 18, textAlign: 'center', marginBottom: spacing.sm },
  description: { fontSize: 14, textAlign: 'center', opacity: 0.6, marginBottom: spacing.md },
  action: { marginTop: spacing.sm },
});
