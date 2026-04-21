import React from "react";
import { TextInput, View, StyleSheet, TextInputProps, ViewStyle } from "react-native";
import { colors } from "../design-system/colors";
import { typography } from "../design-system/typography";
import { spacing } from "../design-system/spacing";

interface InputProps extends TextInputProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  containerStyle?: ViewStyle;
  multiline?: boolean;
  numberOfLines?: number;
}

export default function Input({
  placeholder,
  value,
  onChangeText,
  containerStyle,
  multiline = false,
  numberOfLines = 1,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        style={[styles.input, { color: colors.onSurface }]}
        placeholder={placeholder}
        placeholderTextColor={colors.onSurfaceVariant}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={numberOfLines}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.outline,
    backgroundColor: colors.surface,
    overflow: "hidden",
  },
  input: {
    ...typography.body.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
});
