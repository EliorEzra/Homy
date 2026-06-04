import { StyleSheet, TextInput, type TextInputProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useState } from "react";
import { spacing } from "@/theme/theme";

export type ThemedInputProps = TextInputProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'text' | 'email' | 'password';
};

export function ThemedInput({
  style,
  lightColor,
  darkColor,
  type = 'text',
  ...rest
}: ThemedInputProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const background = useThemeColor({ light: lightColor, dark: darkColor }, 'inputBackground');
  const regularBorderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputBorder');
  const selectedBorderColor = useThemeColor({ light: lightColor, dark: darkColor }, 'inputBorderSelected');
  const [borderColor, setBorderColor] = useState(regularBorderColor);

  return (
    <TextInput
      style={[
        styles.common,
        { color, backgroundColor: background, borderColor },
        style,
      ]}
      inputMode={type === 'email' ? 'email' : 'text'}
      secureTextEntry={type === 'password'}
      onFocus={() => setBorderColor(selectedBorderColor)}
      onBlur={() => setBorderColor(regularBorderColor)}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  common: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    minHeight: 48,
  },
});
