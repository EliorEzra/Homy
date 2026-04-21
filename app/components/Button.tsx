import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "../design-system/colors";
import { typography } from "../design-system/typography";
import { spacing } from "../design-system/spacing";

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function Button({
  onPress,
  title,
  variant = "primary",
  size = "md",
  style,
  textStyle,
  disabled = false,
}: ButtonProps) {
  const baseStyle: ViewStyle = {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: size === "sm" ? spacing.sm : size === "lg" ? spacing.lg : spacing.md,
    paddingHorizontal: size === "sm" ? spacing.md : size === "lg" ? spacing.lg : spacing.lg,
  };

  let backgroundColor = colors.primary.DEFAULT;
  let textColor = colors.neutral[100];

  if (variant === "secondary") {
    backgroundColor = colors.secondary.DEFAULT;
  } else if (variant === "outline") {
    backgroundColor = "transparent";
    textColor = colors.primary.DEFAULT;
  }

  if (disabled) {
    backgroundColor = colors.neutral[300];
    textColor = colors.neutral[600];
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        baseStyle,
        {
          backgroundColor: variant === "outline" ? "transparent" : backgroundColor,
          borderWidth: variant === "outline" ? 2 : 0,
          borderColor: variant === "outline" ? textColor : "transparent",
        },
        style,
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
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
