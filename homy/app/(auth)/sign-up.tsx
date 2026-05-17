import {
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ThemedView, MainView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedFormField } from "@/components/themed-form-field";
import { spacing } from '@/theme/theme';

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length < 2) {
      newErrors.username = "Username must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await signUp(email, password, username);
      if (data) {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert(
          "Signup Error",
          error?.message || "Failed to create account. Please try again."
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
      <Stack.Screen options={{ title: "Create Account", headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <MainView>
          <ThemedView style={styles.headerContainer}>
            <ThemedText type="title" style={styles.title}>Create Account</ThemedText>
            <ThemedText style={styles.subtitle}>Join Homy and manage your household</ThemedText>
          </ThemedView>

          <ThemedFormField
            label="Full Name"
            placeholder="John Doe"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (errors.username) setErrors({ ...errors, username: undefined });
            }}
            error={errors.username}
            required
            inputProps={{
              autoCapitalize: "words",
              editable: !loading,
            }}
            style={styles.field}
          />

          <ThemedFormField
            label="Email Address"
            placeholder="your@email.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            error={errors.email}
            required
            inputProps={{
              autoCapitalize: "none",
              keyboardType: "email-address",
              editable: !loading,
            }}
            style={styles.field}
          />

          <ThemedFormField
            label="Password"
            placeholder="••••••••••"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) setErrors({ ...errors, password: undefined });
            }}
            error={errors.password}
            required
            inputProps={{
              secureTextEntry: true,
              editable: !loading,
            }}
            style={styles.field}
          />

          <ThemedFormField
            label="Confirm Password"
            placeholder="••••••••••"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
            }}
            error={errors.confirmPassword}
            required
            inputProps={{
              secureTextEntry: true,
              editable: !loading,
            }}
            style={styles.field}
          />

          <ThemedButton
            onPress={handleSignUp}
            title={loading ? "Creating Account..." : "Create Account"}
            disabled={loading}
            style={styles.signUpButton}
          />

          <ThemedView style={styles.signInContainer}>
            <ThemedText style={styles.signInText}>
              Already have an account?{" "}
            </ThemedText>
            <ThemedText
              type="link"
              onPress={() => router.replace("/sign-in")}
              style={styles.signInLink}
            >
              Sign in
            </ThemedText>
          </ThemedView>
        </MainView>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  field: {
    width: '100%',
    maxWidth: 300,
  },
  signUpButton: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 300,
  },
  signInContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  signInText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
  },
});
