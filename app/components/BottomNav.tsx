import React from "react";
import { View, TouchableOpacity, Text, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../design-system/colors";
import { spacing } from "../design-system/spacing";
import { typography } from "../design-system/typography";

export type ViewType =
  | "welcome"
  | "join-family"
  | "create-account"
  | "home"
  | "tasks"
  | "finances"
  | "calendar"
  | "shopping-list"
  | "profile"
  | "homy-ai"
  | "family-trip"
  | "family-live"
  | "notifications"
  | "task-detail"
  | "notification-settings";

interface BottomNavProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const navItems = [
    { label: "Home", view: "home" as ViewType, icon: "home" },
    { label: "Tasks", view: "tasks" as ViewType, icon: "checkmark-circle" },
    { label: "Finances", view: "finances" as ViewType, icon: "wallet" },
    { label: "Calendar", view: "calendar" as ViewType, icon: "calendar" },
    { label: "Shopping", view: "shopping-list" as ViewType, icon: "cart" },
    { label: "Profile", view: "profile" as ViewType, icon: "person" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = activeView === item.view;

          return (
            <TouchableOpacity
              key={item.view}
              style={styles.navItem}
              onPress={() => onViewChange(item.view)}
            >
              <Ionicons
                name={item.icon as any}
                size={24}
                color={isActive ? colors.primary.DEFAULT : colors.onSurfaceVariant}
              />
              <Text
                style={[
                  typography.label.sm,
                  {
                    color: isActive ? colors.primary.DEFAULT : colors.onSurfaceVariant,
                    marginTop: spacing.xs,
                  },
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.outline,
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: spacing.sm,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
});
