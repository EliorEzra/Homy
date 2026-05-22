import { Stack } from "expo-router";
import { AuthProvider, useAuth } from "@/context/auth";
import { HouseProvider, useHouse } from "@/context/house";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/theme/theme";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";

export default function Root() {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? 'light'].background;
  return (
    <SafeAreaView style={{flex: 1, backgroundColor}}>
      <AuthProvider>
        <HouseProvider>
          <RootLayout />
        </HouseProvider>
      </AuthProvider>
    </SafeAreaView>
  )
}

SplashScreen.preventAutoHideAsync();

export function RootLayout() {
  const { user, authInitialized } = useAuth()
  const { house, houseInitialized } = useHouse()

  useEffect(() => {
    if (authInitialized && houseInitialized) SplashScreen.hideAsync();
  }, [authInitialized, houseInitialized]);

  if (!(authInitialized && houseInitialized)) return null;

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Protected guard={user == null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user != null && house != null}>
        <Stack.Screen name="(tabs)"/>
      </Stack.Protected>
      <Stack.Protected guard={user != null && house == null}>
        <Stack.Screen name="(house)" />
      </Stack.Protected>
    </Stack>
  );
}
