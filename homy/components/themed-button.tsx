import React from "react";
import { Pressable, Text, StyleSheet, TextStyle, StyleProp, ViewStyle type PressableProps } from "react-native";
import { spacing, typography } from '@/theme/theme'
import { useThemeColor } from "@/hooks/use-theme-color";

export type ButtonProps = PressableProps & {
  title: string;
  size?: "sm" | "md" | "lg";
  textStyle?: TextStyle;
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export default function ThemedButton({
  title,
  size = "md",
  style,
  lightColor,
  darkColor,
  textStyle,
  disabled = false,
  ...rest
}: ButtonProps) {

  const backgroundColor = disabled ? useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonBackground') : 
                                     useThemeColor({light: lightColor, dark: darkColor}, 'buttonBackground')
  const textColor = disabled ? useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonTextColor') :
                               useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonBackground')

  return (
    <Pressable
      disabled={disabled}
      style={[
        {
            backgroundColor: backgroundColor,
            paddingVertical: size === "sm" ? spacing.sm : size === "lg" ? spacing.lg : spacing.md,
            paddingHorizontal: size === "sm" ? spacing.md : size === "lg" ? spacing.lg : spacing.lg,
        },
        style,
        styles.button,
        {...rest}
      ]}
    >
      <Text
        style={[
          typography.body.md,
          {
            color: textColor,
            fontWeight: "600",
          },
          textStyle,
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});