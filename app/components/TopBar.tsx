import React from "react";
import { View, TouchableOpacity, Image, StyleSheet, Text, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../design-system/colors";
import { spacing } from "../design-system/spacing";
import { typography } from "../design-system/typography";
import Logo from "./Logo";

interface TopBarProps {
  userAvatar?: string;
  onSettingsClick?: () => void;
  onNotificationsClick?: () => void;
  onQuickAction?: (action: string) => void;
  unreadCount?: number;
}

export default function TopBar({
  userAvatar,
  onSettingsClick,
  onNotificationsClick,
  unreadCount = 0,
}: TopBarProps) {
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.content}>
        <Logo />

        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={onNotificationsClick}
          >
            <Ionicons name="notifications" size={24} color={colors.onSurface} />
            {unreadCount > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.error.DEFAULT }]}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={onSettingsClick}>
            {userAvatar ? (
              <Image
                source={{ uri: userAvatar }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.primary.DEFAULT }]}>
                <Ionicons name="settings" size={20} color={colors.neutral[100]} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outline,
  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  notificationButton: {
    position: "relative",
  },
  badge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    ...typography.label.sm,
    color: colors.neutral[100],
    fontWeight: "700",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
});
