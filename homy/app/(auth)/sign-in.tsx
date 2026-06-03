import {
  StyleSheet, Alert, View, Image, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Pressable,
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";

export default function SignIn() {
  const { signIn } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'inputBackground');

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: primaryColor }]}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Image
            source={require('@/assets/images/logoHomy.png')}
            style={styles.heroLogo}
            resizeMode="contain"
            tintColor="white"
          />
          <ThemedText style={styles.heroTitle}>Welcome back</ThemedText>
          <ThemedText style={styles.heroSub}>Sign in to access your household</ThemedText>
        </View>

        {/* ── Form sheet ───────────────────────────────────────────────── */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.sheetWrapper}
        >
          <ScrollView
            contentContainerStyle={[styles.sheet, { backgroundColor: cardBg }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText style={[styles.formTitle, { color: textColor }]}>Sign In</ThemedText>

            {/* Email */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Mail size={15} color={primaryColor} />
                <ThemedText style={[styles.label, { color: mutedColor }]}>Email</ThemedText>
              </View>
              <View style={[styles.inputRow, { borderColor, backgroundColor: inputBg }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="you@example.com"
                  placeholderTextColor={mutedColor}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={t => { emailRef.current = t; }}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Lock size={15} color={primaryColor} />
                <ThemedText style={[styles.label, { color: mutedColor }]}>Password</ThemedText>
              </View>
              <View style={[styles.inputRow, { borderColor, backgroundColor: inputBg }]}>
                <TextInput
                  style={[styles.input, { color: textColor, flex: 1 }]}
                  placeholder="Your password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showPassword}
                  onChangeText={t => { passwordRef.current = t; }}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                  {showPassword
                    ? <EyeOff size={18} color={mutedColor} />
                    : <Eye size={18} color={mutedColor} />}
                </Pressable>
              </View>
            </View>

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
              title={loading ? "Signing in…" : "Sign In"}
              disabled={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: mutedColor }]}>Don't have an account?</ThemedText>
              <Pressable onPress={() => router.push("/sign-up")} hitSlop={8}>
                <ThemedText style={[styles.footerLink, { color: primaryColor }]}>Create one</ThemedText>
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
    paddingTop: 56,
    paddingBottom: 36,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroLogo: { width: 200, height: 200, marginBottom: spacing.xs },
  heroTitle: { fontSize: 28, fontWeight: '800', color: 'white', textAlign: 'center' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    minHeight: 50,
  },
  input: { flex: 1, fontSize: 15, paddingVertical: spacing.sm },
  eyeBtn: { paddingLeft: spacing.sm },
  button: { marginTop: spacing.sm, marginBottom: spacing.lg },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: spacing.xs },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: '700' },
});
