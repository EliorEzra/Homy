import { StyleSheet, Alert } from "react-native";
import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView, MainView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { useAuth } from "@/context/auth";

export default function VerifyEmail() {
  // Destructure params passed from sign-up.tsx
  const { userId, email, password } = useLocalSearchParams<{
    userId: string;
    email: string;
    password: string;
  }>();

  const router = useRouter();
  const { verifyEmail } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Handles the verification process
   */
  const handleVerify = async () => {
    // Basic validation
    if (!code || !userId) {
      Alert.alert("Error", "Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);
    try {
      /**
       * We pass userId, trimmed code, email, and password.
       * The password is required in our AuthContext to create a session 
       * before calling Appwrite's updateVerification.
       */
      const { data, error } = await verifyEmail(
        userId, 
        code.trim(), 
        email!, 
        password!
      );

      if (data) {
        Alert.alert("Success", "Your email has been verified successfully!");
        // Redirect to the home screen
        router.replace("/(tabs)/home");
      } else {
        // Log error for debugging and show alert
        console.error("Verification error:", error);
        Alert.alert(
          "Verification Error", 
          error?.message || "Invalid code. Please check your email and try again."
        );
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
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
        <ThemedView style={styles.headerContainer}>
          <ThemedText style={styles.title}>Verify Your Email</ThemedText>
          <ThemedText style={styles.subtitle}>
            We've sent a 6-digit verification code to:{"\n"}
            <ThemedText style={{ fontWeight: "bold" }}>{email}</ThemedText>
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Verification Code</ThemedText>
          <ThemedInput
            placeholder="Enter 6-digit code"
            value={code}
            onChangeText={setCode}
            maxLength={6}
            keyboardType="number-pad"
            autoCapitalize="none"
          />
        </ThemedView>

        <ThemedButton
          onPress={handleVerify}
          title={loading ? "Verifying..." : "Verify Email"}
          disabled={loading}
        />

        <ThemedView style={styles.footerContainer}>
          <ThemedText
            style={styles.backLink}
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
  headerContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    opacity: 0.8,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    color: "#455fff",
    fontWeight: "600",
  },
  footerContainer: {
    marginTop: 32,
    alignItems: "center",
  },
  backLink: {
    fontWeight: "500",
    color: "#455fff",
    textDecorationLine: "underline",
  },
});