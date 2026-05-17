import React from "react";
import { View, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export function ThemedDivider({ style }: { style?: StyleProp<ViewStyle> }) {
  const color = useThemeColor({}, 'tabIconDefault');
  return <View style={[styles.divider, { backgroundColor: color, opacity: 0.2 }, style]} />;
}

const styles = StyleSheet.create({
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
});
