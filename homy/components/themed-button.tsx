import React from "react";
import { Pressable, Text, StyleSheet, TextStyle, StyleProp, ViewStyle, type PressableProps } from "react-native";
import { spacing, typography } from '@/theme/theme'
import { useThemeColor } from "@/hooks/use-theme-color";

export type ButtonProps = PressableProps & {
  title: string;
  size?: "sm" | "md" | "lg";
  textStyle?: TextStyle;
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function ThemedButton({
  title,
  onPress,
  size = "md",
  style,
  lightColor,
  darkColor,
  textStyle,
  disabled = false,
  ...rest
}: ButtonProps) {

  const regularBackgroundColor = useThemeColor({light: lightColor, dark: darkColor}, 'buttonBackground');
  const disabledBackgroundColor = useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonBackground');

  const regularTextColor = useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonBackground');
  const disabledTextColor = useThemeColor({light: lightColor, dark: darkColor}, 'disabledButtonTextColor');

  const backgroundColor = disabled ? disabledBackgroundColor : regularBackgroundColor
  const textColor = disabled ? disabledTextColor : regularTextColor                               

  return (
    <Pressable
      onPress={onPress}
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