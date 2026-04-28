import { StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView, MainView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { useAuth } from "@/context/auth";

export default function VerifyEmail() {
  const { userId, email, password } = useLocalSearchParams<{
    userId: string;
    email: string;
    password: string;
  }>();
  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (!code || !userId) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await verifyEmail(userId, code, email, password!);
      if (data) {
        Alert.alert("Success", "Email verified! Redirecting...");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Verification Error", error?.message || "Invalid code. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Verify Email",
          headerShown: false,
        }}
      />
      <MainView>
        <ThemedView>
          <ThemedText style={styles.title}>Verify Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            We've sent a verification code to {email}. Please enter it below.
          </ThemedText>
        </ThemedView>

        <ThemedView>
          <ThemedText style={styles.label}>Verification Code</ThemedText>
          <ThemedInput
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            maxLength={256}
            autoCapitalize="none"
          />
        </ThemedView>

        <ThemedButton
          onPress={handleVerify}
          title={loading ? "Verifying..." : "Verify Email"}
          disabled={loading}
        />

        <ThemedView style={{ marginTop: 32 }}>
          <ThemedText
            style={{ fontWeight: "500", textAlign: "center" }}
            onPress={() => router.replace("/sign-in")}
          >
            Back to Sign In
          </ThemedText>
        </ThemedView>
      </MainView>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    opacity: 0.7,
  },
  label: {
    marginBottom: 4,
    color: "#455fff",
  },
});
