import React from "react";
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type ActionButtonProps = PressableProps & {
  label: string;
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ActionButton({
  label,
  icon,
  onPress,
  disabled = false,
  lightColor,
  darkColor,
  style,
  ...rest
}: ActionButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    disabled ? 'disabledButtonBackground' : 'buttonBackground'
  );

  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    disabled ? 'disabledButtonTextColor' : 'buttonTextColor'
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        { backgroundColor },
        style,
      ]}
      {...rest}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <Text style={[styles.label, { color: textColor }, typography.label.md]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
  },
  iconContainer: {
    marginBottom: spacing.sm,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    textAlign: 'center',
  },
});
