import React from "react";
import {
  View,
  Text,
  TextInputProps,
  ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedInput } from "./themed-input";

export type ThemedFormFieldProps = ViewProps & {
  label: string;
  error?: string;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  inputProps?: TextInputProps;
  required?: boolean;
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ThemedFormField({
  label,
  error,
  placeholder,
  value,
  onChangeText,
  inputProps,
  required = false,
  lightColor,
  darkColor,
  style,
  ...rest
}: ThemedFormFieldProps) {
  const labelColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  const errorColor = useThemeColor({}, 'text');

  return (
    <View
      style={[
        styles.container,
        style,
      ]}
      {...rest}
    >
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: labelColor }]}>
          {label}
          {required && <Text style={styles.required}>*</Text>}
        </Text>
      </View>
      <ThemedInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        {...inputProps}
      />
      {error && (
        <Text style={[styles.error, { color: '#ff3748' }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
  },
  labelContainer: {
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.label.md,
    fontWeight: '600',
  },
  required: {
    color: '#ff3748',
    marginLeft: 2,
  },
  error: {
    ...typography.label.sm,
    marginTop: spacing.xs,
  },
});
