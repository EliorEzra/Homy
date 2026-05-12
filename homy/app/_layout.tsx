import { Stack } from "expo-router";
import { AuthProvider } from "@/context/auth";
import { HouseProvider } from "@/context/house";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaView style={{flex:1}}>
      <AuthProvider>
        <HouseProvider>
            <Stack screenOptions={{headerShown: false}} />
        </HouseProvider>
      </AuthProvider>
    </SafeAreaView>
  );
}