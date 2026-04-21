import React from "react";
import { View, ScrollView, StyleSheet, SafeAreaView } from "react-native";
import { colors } from "../design-system/colors";
import TopBar from "./TopBar";
import BottomNav, { ViewType } from "./BottomNav";
import { spacing } from "../design-system/spacing";

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  onQuickAction?: (action: string) => void;
  userAvatar?: string;
  unreadCount?: number;
}

export default function Layout({
  children,
  activeView,
  onViewChange,
  userAvatar,
  unreadCount = 0,
}: LayoutProps) {
  return (
    <SafeAreaView style={styles.container}>
      <TopBar
        userAvatar={userAvatar}
        onSettingsClick={() => onViewChange("profile")}
        onNotificationsClick={() => onViewChange("notifications")}
        unreadCount={unreadCount}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      <BottomNav activeView={activeView} onViewChange={onViewChange} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
});
