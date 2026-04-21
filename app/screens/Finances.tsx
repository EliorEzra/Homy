import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { typography } from "../design-system/typography";
import { colors } from "../design-system/colors";

export default function Finances() {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading[1], { color: colors.onSurface }]}>
        Finances
      </Text>
      <Text style={[typography.body.md, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
        Track family finances
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});
