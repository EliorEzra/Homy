import { StyleSheet, Alert, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from '@/components/themed-button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from "@/components/themed-text";
import { ThemedCard } from "@/components/themed-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { Home, Mail, Lock } from "lucide-react-native";

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

            <View style={styles.logoSection}>
              <View style={[styles.logoIcon, { backgroundColor: primaryColor }]}>
                <Home size={32} color="white" />
              </View>
              <ThemedText style={styles.logoText}>HOMY</ThemedText>
              <ThemedText style={[styles.tagline, { color: mutedColor }]}>Your household, organized</ThemedText>
            </View>

            <ThemedText style={styles.title}>Welcome back</ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
              Sign in to your account to continue.
            </ThemedText>

            <ThemedCard variant="elevated" style={styles.card}>
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Mail size={16} color={primaryColor} />
                  <ThemedText style={styles.label}>Email</ThemedText>
                </View>
                <ThemedInput
                  type="email"
                  placeholder="you@example.com"
                  autoCapitalize="none"
                  nativeID="email"
                  onChangeText={(text) => { emailRef.current = text; }}
                />
              </View>

              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Lock size={16} color={primaryColor} />
                  <ThemedText style={styles.label}>Password</ThemedText>
                </View>
                <ThemedInput
                  placeholder="Your password"
                  type="password"
                  nativeID="password"
                  onChangeText={(text) => { passwordRef.current = text; }}
                />
              </View>
            </ThemedCard>

            <ThemedButton
              onPress={async () => {
                if (!emailRef.current || !passwordRef.current) {
                  Alert.alert("Missing Fields", "Please enter your email and password.");
                  return;
                }
                setLoading(true);
                const { data, error } = await signIn(emailRef.current, passwordRef.current);
                setLoading(false);
                if (data) {
                  router.replace("/(tabs)");
                } else {
                  Alert.alert("Login Error", error?.message);
                }
              }}
              title={loading ? "Signing in..." : "Sign In"}
              disabled={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: mutedColor }]}>Don't have an account?</ThemedText>
              <ThemedText
                style={[styles.footerLink, { color: primaryColor }]}
                onPress={() => router.push("/sign-up")}
              >
                Create one
              </ThemedText>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
  logoSection: { alignItems: 'center', marginBottom: spacing.xl },
  logoIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  logoText: { fontSize: 28, fontWeight: '900', letterSpacing: 4, marginBottom: spacing.xs },
  tagline: { fontSize: 14 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  card: { gap: spacing.lg, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontWeight: '700', fontSize: 15 },
  button: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
