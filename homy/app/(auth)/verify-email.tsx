import { StyleSheet, Alert, View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { ThemedInput } from "@/components/themed-input";
import { ThemedCard } from "@/components/themed-card";
import { useAuth } from "@/context/auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { Home, Mail, ShieldCheck } from "lucide-react-native";

export default function VerifyEmail() {
  const { userId, email, password } = useLocalSearchParams<{
    userId: string;
    email: string;
    password: string;
  }>();

  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!code || !userId) {
      Alert.alert("Missing Code", "Please enter the verification code sent to your email.");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await verifyEmail(userId, code.trim(), email!, password!);
      if (data) {
        Alert.alert("Success", "Your email has been verified successfully!");
        router.replace("/(tabs)/home");
      } else {
        Alert.alert("Verification Error", error?.message || "Invalid code. Please check your email and try again.");
      }
    } catch {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!userId || !email) return;
    setResending(true);
    const { error } = await resendVerification(userId, email);
    setResending(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Code Sent", `A new verification code was sent to ${email}.`);
    }
  };

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
            </View>

            <View style={[styles.iconBox, { backgroundColor: `${primaryColor}15` }]}>
              <ShieldCheck size={40} color={primaryColor} />
            </View>

            <ThemedText style={styles.title}>Verify your email</ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
              We sent a 6-digit code to
            </ThemedText>
            <ThemedText style={[styles.emailText, { color: primaryColor }]}>{email}</ThemedText>

            <ThemedCard variant="elevated" style={styles.card}>
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Mail size={16} color={primaryColor} />
                  <ThemedText style={styles.label}>Verification Code</ThemedText>
                </View>
                <ThemedInput
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={setCode}
                  maxLength={6}
                  keyboardType="number-pad"
                  autoCapitalize="none"
                />
              </View>
            </ThemedCard>

            <ThemedButton
              onPress={handleVerify}
              title={loading ? "Verifying..." : "Verify Email"}
              disabled={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <ThemedText
                style={[styles.footerLink, { color: primaryColor }]}
                onPress={resending ? undefined : handleResend}
              >
                {resending ? "Sending..." : "Resend code"}
              </ThemedText>
              <ThemedText style={[styles.footerDot, { color: mutedColor }]}>·</ThemedText>
              <ThemedText
                style={[styles.footerLink, { color: mutedColor }]}
                onPress={() => router.replace("/sign-in")}
              >
                Back to Sign In
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
  logoText: { fontSize: 28, fontWeight: '900', letterSpacing: 4 },
  iconBox: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.sm, textAlign: 'center' },
  subtitle: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emailText: { fontSize: 15, fontWeight: '700', textAlign: 'center', marginBottom: spacing.lg, marginTop: spacing.xs },
  card: { gap: spacing.lg, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontWeight: '700', fontSize: 15 },
  button: { marginTop: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xl },
  footerLink: { fontSize: 14, fontWeight: '600' },
  footerDot: { fontSize: 14 },
});
