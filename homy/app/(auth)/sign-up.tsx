import {
  StyleSheet, Alert, View, Image, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Pressable,
  ImageSourcePropType,
} from "react-native";
import { useAuth } from "@/context/auth";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react-native";

export default function SignUp() {
  const { signUp } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const cardBg = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'inputBackground');

  const emailRef = useRef("");
  const passwordRef = useRef("");
  const confirmPasswordRef = useRef("");
  const userNameRef = useRef("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.root, { backgroundColor: primaryColor }]}>
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Image
            source={require('@/assets/images/logoHomy.png') as ImageSourcePropType}
            style={styles.heroLogo}
            resizeMode="contain"
            tintColor="white"
          />
          <ThemedText style={styles.heroTitle}>Join Homy</ThemedText>
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
            <ThemedText style={[styles.formTitle, { color: textColor }]}>Create Account</ThemedText>

            {/* Username */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <User size={15} color={primaryColor} />
                <ThemedText style={[styles.label, { color: mutedColor }]}>Name</ThemedText>
              </View>
              <View style={[styles.inputRow, { borderColor, backgroundColor: inputBg }]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Your name"
                  placeholderTextColor={mutedColor}
                  autoCapitalize="words"
                  onChangeText={t => { userNameRef.current = t; }}
                />
              </View>
            </View>

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
                  placeholder="At least 8 characters"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showPassword}
                  onChangeText={t => { passwordRef.current = t; }}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={18} color={mutedColor} /> : <Eye size={18} color={mutedColor} />}
                </Pressable>
              </View>
            </View>

            {/* Confirm password */}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabel}>
                <Lock size={15} color={primaryColor} />
                <ThemedText style={[styles.label, { color: mutedColor }]}>Confirm Password</ThemedText>
              </View>
              <View style={[styles.inputRow, { borderColor, backgroundColor: inputBg }]}>
                <TextInput
                  style={[styles.input, { color: textColor, flex: 1 }]}
                  placeholder="Repeat your password"
                  placeholderTextColor={mutedColor}
                  secureTextEntry={!showConfirm}
                  onChangeText={t => { confirmPasswordRef.current = t; }}
                />
                <Pressable onPress={() => setShowConfirm(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                  {showConfirm ? <EyeOff size={18} color={mutedColor} /> : <Eye size={18} color={mutedColor} />}
                </Pressable>
              </View>
            </View>

            <ThemedButton
              onPress={() => {
                if (!emailRef.current || !passwordRef.current || !userNameRef.current) {
                  Alert.alert("Missing Fields", "Please fill in all fields.");
                  return;
                }
                if (passwordRef.current !== confirmPasswordRef.current) {
                  Alert.alert("Password Mismatch", "Passwords do not match.");
                  return;
                }
                if (passwordRef.current.length < 8) {
                  Alert.alert("Weak Password", "Password must be at least 8 characters.");
                  return;
                }
                setLoading(true);
                signUp(emailRef.current, passwordRef.current, userNameRef.current).then(({data, error}) => {
                  setLoading(false);
                  if (data) {
                    router.push({
                      pathname: "/verify-email",
                      params: { userId: data.userId, email: data.email, password: passwordRef.current },
                    });
                  } else {
                    Alert.alert("Sign Up Error", error?.message);
                  }
                }).catch((err) => {
                  console.log("Unexpected error caught in sign up", err);
                  Alert.alert("Unexpected Sign Up Error Occurred");
                })
                
              }}
              title={loading ? "Creating account…" : "Create Account"}
              disabled={loading}
              style={styles.button}
            />

            <View style={styles.footer}>
              <ThemedText style={[styles.footerText, { color: mutedColor }]}>Already have an account?</ThemedText>
              <Pressable onPress={() => router.replace("/sign-in")} hitSlop={8}>
                <ThemedText style={[styles.footerLink, { color: primaryColor }]}>Sign in</ThemedText>
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
    paddingTop: 44,
    paddingBottom: 48,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroLogo: { width: 100, height: 100, marginBottom: spacing.xs },
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
