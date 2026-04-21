import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { typography } from "../design-system/typography";
import { colors } from "../design-system/colors";

interface NotificationsProps {
  onSettingsClick?: () => void;
}

export default function Notifications({ onSettingsClick }: NotificationsProps) {
  return (
    <View style={styles.container}>
      <Text style={[typography.heading[1], { color: colors.onSurface }]}>
        Notifications
      </Text>
      <Text style={[typography.body.md, { color: colors.onSurfaceVariant, marginTop: 16 }]}>
        No notifications yet
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
});
