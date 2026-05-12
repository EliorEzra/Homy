import {
  StyleSheet,
  Alert
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useRef } from "react";
import { ThemedView, MainView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const userNameRef = useRef("");
  console.log("In signup")
  return (
    <>
      <Stack.Screen options={{ title: "sign up", headerShown: false }} />
      <MainView>
        <ThemedView>
          <ThemedText style={styles.label}>UserName</ThemedText>
          <ThemedInput
            placeholder="Username"
            autoCapitalize="none"
            nativeID="userName"
            onChangeText={(text) => {
              userNameRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedInput
            placeholder="email"
            autoCapitalize="none"
            nativeID="email"
            type="email"
            onChangeText={(text) => {
              emailRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.label}>Password</ThemedText>
          <ThemedInput
            placeholder="password"
            nativeID="password"
            type="password"
            onChangeText={(text) => {
              passwordRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedView>
          <ThemedText style={styles.label}>Confirm Password</ThemedText>
          <ThemedInput
            placeholder="confirm password"
            nativeID="confirmPassword"
            type="password"
            onChangeText={(text) => {
              confirmPasswordRef.current = text;
            }}
          />
        </ThemedView>

        <ThemedButton
          onPress={async () => {
            if (!emailRef.current || !passwordRef.current || !userNameRef.current) {
              Alert.alert("Error", "Please fill in all fields");
              return;
            }
            if (passwordRef.current !== confirmPasswordRef.current) {
              Alert.alert("Error", "Passwords do not match. Please try again.");
              return;
            }
            if (passwordRef.current.length < 8) {
              Alert.alert("Error", "Password must be at least 8 characters long");
              return;
            }
            const { data, error } = await signUp(
              emailRef.current,
              passwordRef.current,
              userNameRef.current
            );
            if (data) {
              // Redirect to email verification screen
              router.push({
                pathname: "/verify-email",
                params: {
                  userId: data.userId,
                  email: data.email,
                  password: passwordRef.current,
                },
              });
            } else {
              Alert.alert("Error signing up", error?.message);
            }
          }}
          title="Create Account"
        />
        <ThemedView style={{ marginTop: 32 }}>
          <ThemedText
            style={{ fontWeight: "500" }}
            onPress={() => router.replace("/sign-in")}
          >
            Click Here To Return To Sign In Page
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
  }
});