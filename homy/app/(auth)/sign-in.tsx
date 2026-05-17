import {
  Text,
  StyleSheet,
  Alert
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useRef } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/themed-button'
import { MainView, ThemedView } from '@/components/themed-view';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();

  const emailRef = useRef("");
  const passwordRef = useRef("");

  return (
    <>
      <Stack.Screen options={{ title: "sign up", headerShown: false }} />
      <MainView>
        <ThemedView>
          <Text style={styles.label}>Email</Text>
          <ThemedInput
            type="email"
            placeholder="email"
            autoCapitalize="none"
            nativeID="email"
            onChangeText={(text) => {
              emailRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedView>
          <Text style={styles.label}>Password</Text>
          <ThemedInput
            placeholder="password"
            type="password"
            nativeID="password"
            onChangeText={(text) => {
              passwordRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedButton
          onPress={async () => {
            const { data, error } = await signIn(
              emailRef.current,
              passwordRef.current
            );
            if (data) {
              router.replace("/(tabs)/home");
            } else {
              console.log(error);
              Alert.alert("Login Error", error?.message);
            }
          }}
          title="Login"
          textStyle={styles.buttonText}
        />
        <ThemedView style={{ marginTop: 32 }}>
          <ThemedText
            style={{ fontWeight: "500" }}
            onPress={() => router.push("/sign-up")}
          >
            Click Here To Create A New Account
          </ThemedText>
        </ThemedView>
      </MainView>
    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 4,
    color: "#455fff",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});
