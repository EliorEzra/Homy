import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedInput } from "./themed-input";
import { spacing } from "@/theme/theme";

export type ThemedFormFieldProps = {
  label?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  error?: string;
  required?: boolean;
  inputProps?: React.ComponentProps<typeof ThemedInput>;
  style?: StyleProp<ViewStyle>;
};

export function ThemedFormField({ label, placeholder, value, onChangeText, error, required, inputProps, style }: ThemedFormFieldProps) {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <ThemedText style={styles.label}>
          {label}{required && <ThemedText style={styles.required}> *</ThemedText>}
        </ThemedText>
      )}
      <ThemedInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={error ? styles.inputError : undefined}
        {...inputProps}
      />
      {error && <ThemedText style={styles.error}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.xs },
  required: { color: '#e03040' },
  inputError: { borderColor: '#e03040' },
  error: { color: '#e03040', fontSize: 12, marginTop: spacing.xs },
});
