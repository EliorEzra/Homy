import { Stack } from "expo-router";
import { AuthProvider } from "@/context/auth";
import { HouseProvider } from "@/context/house";
import { TasksProvider } from "@/context/tasks_db";
import { EventsProvider } from "@/context/events_db";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/theme/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <AuthProvider>
        <HouseProvider>
          <TasksProvider>
            <EventsProvider>
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor },
                }}
              />
            </EventsProvider>
          </TasksProvider>
        </HouseProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}
