import { StyleSheet, Alert, View, Image, KeyboardAvoidingView, Platform, ScrollView, Pressable, ImageSourcePropType } from "react-native";
import { useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useAuth } from "@/context/auth";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { ThemedInput } from "@/components/themed-input";
import { ShieldCheck, Mail } from "lucide-react-native";

export default function VerifyEmail() {
  const { userId, email, password } = useLocalSearchParams<{
    userId: string; email: string; password: string;
  }>();

  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'cardBackground');
  const textColor = useThemeColor({}, 'text');

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = () => {
    if (!code || !userId) {
      Alert.alert("Missing Code", "Please enter the verification code sent to your email.");
      return;
    }
    setLoading(true);
    verifyEmail(userId, code.trim())
    .then(({ data, error }) => {
        if (data) {
          router.replace("/(tabs)");
        } else {
          Alert.alert("Verification Error", error?.message || "Invalid code. Please check your email and try again.");
        }
      })
    .catch(() => Alert.alert("Error", "An unexpected error occurred. Please try again."))
    .finally(() => setLoading(false))
  };

  const handleResend = () => {
    if (!userId || !email) return;
    setResending(true);
    resendVerification(userId, email)
    .then(({error}) => {
      setResending(false);
      if (error) Alert.alert("Error", error.message);
      else Alert.alert("Code Sent", `A new verification code was sent to ${email}.`);
    })
    .catch((err) => console.log("Unexpected error occurred in handleResend", err))
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: primaryColor }]}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Image
            source={require('@/assets/images/logoHomy.png') as ImageSourcePropType}
            style={styles.heroLogo}
            resizeMode="contain"
            tintColor="white"
          />
          <View style={styles.shieldBox}>
            <ShieldCheck size={36} color="white" />
          </View>
          <ThemedText style={styles.heroTitle}>Verify your email</ThemedText>
          <ThemedText style={styles.heroSub}>
            We sent a code to{'\n'}
            <ThemedText style={styles.heroEmail}>{email}</ThemedText>
          </ThemedText>
        </View>

        {/* Form sheet */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrapper}>
          <ScrollView
            contentContainerStyle={[styles.sheet, { backgroundColor: cardBg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText style={[styles.formTitle, { color: textColor }]}>Enter Code</ThemedText>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Mail size={15} color={primaryColor} />
                <ThemedText style={[styles.label, { color: mutedColor }]}>Verification Code</ThemedText>
              </View>
              <ThemedInput
                placeholder="6-digit code"
                value={code}
                onChangeText={setCode}
                maxLength={6}
                keyboardType="number-pad"
                autoCapitalize="none"
                style={styles.codeInput}
              />
            </View>

            <ThemedButton
              onPress={handleVerify}
              title={loading ? "Verifying…" : "Verify Email"}
              disabled={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Pressable onPress={resending ? undefined : handleResend} hitSlop={8}>
                <ThemedText style={[styles.footerLink, { color: primaryColor }]}>
                  {resending ? "Sending…" : "Resend code"}
                </ThemedText>
              </Pressable>
              <ThemedText style={[styles.dot, { color: mutedColor }]}>·</ThemedText>
              <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
                <ThemedText style={[styles.footerLink, { color: mutedColor }]}>Back to Sign In</ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: {
    paddingTop: 64,
    paddingBottom: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  heroLogo: { width: 110, height: 110, marginBottom: spacing.md },
  shieldBox: { marginBottom: spacing.xs },
  heroTitle: { fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', lineHeight: 22 },
  heroEmail: { fontWeight: '700', color: 'white' },
  sheetWrapper: { flex: 1, marginTop: -28 },
  sheet: {
    flexGrow: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['5xl'],
  },
  formTitle: { fontSize: 22, fontWeight: '800', marginBottom: spacing.xl },
  fieldGroup: { marginBottom: spacing.lg },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  label: { fontSize: 13, fontWeight: '600' },
  codeInput: { fontSize: 22, textAlign: 'center', letterSpacing: 8, fontWeight: '700' },
  button: { marginTop: spacing.sm, marginBottom: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerLink: { fontSize: 14, fontWeight: '600' },
  dot: { fontSize: 14 },
});
