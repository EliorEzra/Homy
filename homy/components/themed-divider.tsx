import React from "react";
import {
  View,
  ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedDividerProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function ThemedDivider({
  orientation = "horizontal",
  lightColor,
  darkColor,
  style,
  ...rest
}: ThemedDividerProps) {
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'outline'
  );

  return (
    <View
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { borderColor },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  horizontal: {
    width: '100%',
    height: 1,
    borderBottomWidth: 1,
  },
  vertical: {
    width: 1,
    height: '100%',
    borderRightWidth: 1,
  },
});
