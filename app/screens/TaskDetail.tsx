import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { typography } from "../design-system/typography";
import { colors } from "../design-system/colors";

export default function TaskDetail() {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading[1], { color: colors.onSurface }]}>
        Task Detail
      </Text>
      <Text style={[typography.body.md, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
        Task details
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});
