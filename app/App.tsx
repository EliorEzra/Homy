import React, { useState, useEffect } from "react";
import { View, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import Layout from "./components/Layout";
import { ViewType } from "./components/BottomNav";
import Home from "./screens/Home";
import Tasks from "./screens/Tasks";
import Finances from "./screens/Finances";
import Calendar from "./screens/Calendar";
import ShoppingList from "./screens/ShoppingList";
import Profile from "./screens/Profile";
import HomyAI from "./screens/HomyAI";
import FamilyTrip from "./screens/FamilyTrip";
import FamilyLiveStatus from "./screens/FamilyLiveStatus";
import Notifications from "./screens/Notifications";
import TaskDetail from "./screens/TaskDetail";
import NotificationSettings from "./screens/NotificationSettings";
import Welcome from "./screens/Welcome";
import JoinFamily from "./screens/JoinFamily";
import CreateAccount from "./screens/CreateAccount";
import { Socket } from "socket.io-client";
import { getSocket, disconnectSocket } from "./services/socket";
import { colors } from "./design-system/colors";

export default function App() {
  const [activeView, setActiveView] = useState<ViewType>("welcome");
  const [unreadCount, setUnreadCount] = useState(2);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = getSocket();
    setSocket(s);

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNotification = () => {
      if (activeView !== "notifications") {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [socket, activeView]);

  useEffect(() => {
    if (activeView === "notifications") {
      setUnreadCount(0);
    }
  }, [activeView]);

  const userAvatar =
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBb1cGlr6LQoFPZ_HCD59lm5QuNxLsvxZYzevIrw4hVedXJZ4OmvVSasLWsIbgeg3hxlcyqeDPNXcbU4MCejDvTx-9XoNvVonbpjo8gt1Fei8940LnWxryXRiDVcD1772--IbHE4nXc3a0Ofra4b4GdTKTDiIget8Q2YeUPNvfwMJZhu9jzBkTmopFl5VZAN7NjvYqCZVhNqKNp32p09fvzRXDjqpYrkHbr2KYv4yNQ1dXL66U0AjUN6bb12xr5Sj_RlT6MzzAxlWAt";

  const renderView = () => {
    switch (activeView) {
      case "welcome":
        return <Welcome />;
      case "join-family":
        return <JoinFamily />;
      case "create-account":
        return <CreateAccount />;
      case "home":
        return <Home />;
      case "tasks":
        return <Tasks />;
      case "finances":
        return <Finances />;
      case "calendar":
        return <Calendar />;
      case "shopping-list":
        return <ShoppingList />;
      case "profile":
        return <Profile />;
      case "homy-ai":
        return <HomyAI />;
      case "family-trip":
        return <FamilyTrip />;
      case "family-live":
        return <FamilyLiveStatus />;
      case "notifications":
        return <Notifications />;
      case "task-detail":
        return <TaskDetail />;
      case "notification-settings":
        return <NotificationSettings />;
      default:
        return <Home />;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <StatusBar barStyle="dark-content" />
      <Layout
        activeView={activeView}
        onViewChange={setActiveView}
        userAvatar={userAvatar}
        unreadCount={unreadCount}
      >
        {renderView()}
      </Layout>
    </View>
  );
}
