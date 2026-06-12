import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/auth";
import { HouseProvider, useHouse } from "@/context/house";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/theme/theme";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";

SplashScreen.preventAutoHideAsync().catch(() => {});

// Custom navigation themes — these govern the background colour that React
// Navigation paints on every card / navigator during animations. Without this,
// the internal NavigationContainer defaults to white, causing the flashbang
// on dark mode transitions.
const AppLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Colors.light.background,   // #e2e8f0
    card:       Colors.light.cardBackground,
    primary:    Colors.light.buttonBackground,
    border:     Colors.light.inputBorder,
    text:       Colors.light.text,
    notification: Colors.light.buttonBackground,
  },
};

const AppDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: Colors.dark.background,    // #111416
    card:       Colors.dark.cardBackground,
    primary:    Colors.dark.buttonBackground,
    border:     Colors.dark.inputBorder,
    text:       Colors.dark.text,
    notification: Colors.dark.buttonBackground,
  },
};

export default function Root() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  return (
    // ThemeProvider sets the theme on Expo Router's internal NavigationContainer,
    // eliminating white flashes during Stack / Tab transitions in dark mode.
    <ThemeProvider value={colorScheme === 'dark' ? AppDarkTheme : AppLightTheme}>
      <SafeAreaView style={{ flex: 1, backgroundColor }}>
        <AuthProvider>
          <HouseProvider>
            <RootLayout />
          </HouseProvider>
        </AuthProvider>
      </SafeAreaView>
    </ThemeProvider>
  );
}

export function RootLayout() {
  const { user, authInitialized } = useAuth();
  const { house, houseInitialized } = useHouse();
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;

  const ready = authInitialized && houseInitialized;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().then(() => {}).catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <Stack screenOptions={{
      headerShown: false,
      contentStyle: { backgroundColor },
    }}>
      <Stack.Protected guard={user == null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user != null && house != null}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={user != null && house == null}>
        <Stack.Screen name="(house)" />
      </Stack.Protected>
    </Stack>
  );
}
