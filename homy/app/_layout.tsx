import { Stack } from "expo-router";
import { AuthProvider } from "@/context/auth";
import { HouseProvider } from "@/context/house";
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
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor },
            }}
          />
        </HouseProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}
