import { Stack } from "expo-router";
import { AuthProvider } from "@/context/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/theme/theme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor },
          }}
        />
      </SafeAreaView>
    </AuthProvider>
  );
}
