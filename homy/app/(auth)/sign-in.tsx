import {
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/themed-button'
import { MainView, ThemedView } from '@/components/themed-view';
import { ThemedFormField } from '@/components/themed-form-field';
import { spacing, typography } from '@/theme/theme';

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (data) {
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Login Error", error?.message || "Failed to sign in. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Sign In", headerShown: false }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
        <MainView>
          <ThemedView style={styles.headerContainer}>
            <ThemedText type="title" style={styles.title}>Welcome Back</ThemedText>
            <ThemedText style={styles.subtitle}>Sign in to your Homy account</ThemedText>
          </ThemedView>

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
            placeholder="••••••••"
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

          <ThemedButton
            onPress={handleSignIn}
            title={loading ? "Signing In..." : "Sign In"}
            disabled={loading}
            style={styles.signInButton}
          />

          <ThemedView style={styles.dividerContainer}>
            <ThemedText type="defaultSemiBold" style={styles.orText}>OR</ThemedText>
          </ThemedView>

          <ThemedView style={styles.signUpContainer}>
            <ThemedText style={styles.signUpText}>
              Don't have an account?{" "}
            </ThemedText>
            <ThemedText
              type="link"
              onPress={() => router.push("/sign-up")}
              style={styles.signUpLink}
            >
              Create one
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
  signInButton: {
    marginTop: spacing.lg,
    width: '100%',
    maxWidth: 300,
  },
  dividerContainer: {
    marginVertical: spacing.xl,
    alignItems: 'center',
  },
  orText: {
    opacity: 0.5,
  },
  signUpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
  },
});
