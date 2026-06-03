import { StyleSheet, Alert, View, Image, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useHouse } from "@/context/house";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from '@/components/themed-button';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from "@/components/themed-text";
import { ThemedCard } from "@/components/themed-card";
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing } from "@/theme/theme";
import { X, Users, Heart, Coffee, Pencil, LogIn, Home } from "lucide-react-native";

// ─── Preset role templates ────────────────────────────────────────────────────

type Preset = { id: string; label: string; icon: React.ReactNode; roles: string[] };

const PRESETS: Preset[] = [
  {
    id: 'family',
    label: 'Family',
    icon: <Heart size={16} color="white" />,
    roles: ['Parent', 'Child', 'Grandparent', 'Guardian'],
  },
  {
    id: 'roommates',
    label: 'Roommates',
    icon: <Coffee size={16} color="white" />,
    roles: ['Roommate', 'Tenant', 'Landlord'],
  },
  {
    id: 'custom',
    label: 'Custom',
    icon: <Pencil size={16} color="white" />,
    roles: [],
  },
];

const PRESET_COLORS: Record<string, string> = {
  family: '#106d8f',
  roommates: '#61b2cf',
  custom: '#1fc16b',
};

// ─── Tag input ────────────────────────────────────────────────────────────────

function TagInput({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [input, setInput] = useState('');
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');

  const addTag = (val: string) => {
    const trimmed = val.trim().replace(/[,.]$/, '').trim();
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setInput('');
  };

  const handleChange = (text: string) => {
    if (text.endsWith(',') || text.endsWith('.')) { addTag(text); return; }
    setInput(text);
  };

  return (
    <View style={[tagStyles.container, { borderColor, backgroundColor: inputBg }]}>
      <View style={tagStyles.tagsRow}>
        {tags.map(tag => (
          <View key={tag} style={[tagStyles.tag, { backgroundColor: `${primaryColor}20`, borderColor: `${primaryColor}40` }]}>
            <ThemedText style={[tagStyles.tagText, { color: primaryColor }]}>{tag}</ThemedText>
            <Pressable onPress={() => onChange(tags.filter(t => t !== tag))} hitSlop={4}>
              <X size={12} color={primaryColor} />
            </Pressable>
          </View>
        ))}
        <TextInput
          style={[tagStyles.input, { color: textColor }]}
          placeholder={tags.length === 0 ? "e.g. parent, child..." : "Add role..."}
          placeholderTextColor={mutedColor}
          value={input}
          onChangeText={handleChange}
          onSubmitEditing={() => addTag(input)}
          returnKeyType="done"
          blurOnSubmit={false}
        />
      </View>
    </View>
  );
}

const tagStyles = StyleSheet.create({
  container: { borderWidth: 1, borderRadius: 10, padding: spacing.sm, minHeight: 52 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  tagText: { fontSize: 13, fontWeight: '600' },
  input: { fontSize: 14, paddingVertical: 4, minWidth: 120, flex: 1 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CreateHouse() {
  const { createHouse, joinHouseByCode } = useHouse();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const textColor = useThemeColor({}, 'text');
  const inputBg = useThemeColor({}, 'inputBackground');
  const cardBg = useThemeColor({}, 'cardBackground');

  // Mode toggle
  const [mode, setMode] = useState<'create' | 'join'>('create');

  // Create mode state
  const houseNameRef = useRef("");
  const [selectedPreset, setSelectedPreset] = useState<string>('family');
  const [roles, setRoles] = useState<string[]>(PRESETS[0].roles);
  const [loading, setLoading] = useState(false);

  // Join mode state
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') setRoles(preset.roles);
    else setRoles([]);
  };

  const handleJoin = async () => {
    const code = joinCode.trim();
    if (!code) { Alert.alert("Missing Code", "Please enter the invite code."); return; }
    setJoining(true);
    const { error } = await joinHouseByCode(code);
    setJoining(false);
    if (error) {
      Alert.alert("Could Not Join", error?.message ?? "Invalid or expired code.");
    } else {
      // Navigation is handled by useProtectedRoute once house state updates
      router.replace("/(tabs)");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={[styles.container, { backgroundColor: primaryColor }]}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: primaryColor }]}>
          <Image
            source={require('@/assets/images/logoHomy.png')}
            style={styles.heroLogo}
            resizeMode="contain"
            tintColor="white"
          />
          <ThemedText style={styles.heroTitle}>Your Household</ThemedText>
          <ThemedText style={styles.heroSub}>Create a new home or join an existing one</ThemedText>
        </View>

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.sheetWrapper}>
          <ScrollView contentContainerStyle={[styles.scroll, { backgroundColor: cardBg }]} showsVerticalScrollIndicator={false}>


            {/* Mode toggle */}
            <View style={[styles.modeToggle, { borderColor }]}>
              <Pressable
                style={[styles.modeTab, { backgroundColor: inputBg }, mode === 'create' && { backgroundColor: primaryColor }]}
                onPress={() => setMode('create')}
              >
                <Home size={15} color={mode === 'create' ? 'white' : mutedColor} />
                <ThemedText style={[styles.modeTabText, { color: mode === 'create' ? 'white' : mutedColor }]}>
                  Create a House
                </ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modeTab, { backgroundColor: inputBg }, mode === 'join' && { backgroundColor: primaryColor }]}
                onPress={() => setMode('join')}
              >
                <LogIn size={15} color={mode === 'join' ? 'white' : mutedColor} />
                <ThemedText style={[styles.modeTabText, { color: mode === 'join' ? 'white' : mutedColor }]}>
                  Join a House
                </ThemedText>
              </Pressable>
            </View>

            {mode === 'create' && (
              <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                Give your home a name and define the roles for your household members.
              </ThemedText>
            )}
            {mode === 'join' && (
              <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
                Enter the invite code shared by your household owner to request access.
              </ThemedText>
            )}

            {/* ── Join form ─────────────────────────────── */}
            {mode === 'join' && (
              <>
                <ThemedCard variant="elevated" style={styles.card}>
                  <View style={styles.field}>
                    <View style={styles.fieldHeader}>
                      <LogIn size={16} color={primaryColor} />
                      <ThemedText style={styles.label}>Invite Code</ThemedText>
                    </View>
                    <ThemedText style={[styles.hint, { color: mutedColor }]}>
                      Ask the house owner for their code — find it in their Settings page.
                    </ThemedText>
                    <TextInput
                      style={[styles.codeInput, { borderColor, backgroundColor: inputBg, color: textColor }]}
                      placeholder="Paste or type the invite code"
                      placeholderTextColor={mutedColor}
                      value={joinCode}
                      onChangeText={setJoinCode}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </ThemedCard>
                <ThemedButton
                  onPress={handleJoin}
                  title={joining ? "Sending…" : "Request to Join"}
                  disabled={joining}
                  style={styles.button}
                />
              </>
            )}

            {/* ── Create form ───────────────────────────── */}
            {mode === 'create' && <><ThemedCard variant="elevated" style={styles.card}>

              {/* House Name */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Home size={16} color={primaryColor} />
                  <ThemedText style={styles.label}>House Name</ThemedText>
                </View>
                <ThemedInput
                  type="text"
                  placeholder="e.g. The Smith Family"
                  autoCapitalize="words"
                  nativeID="house_name"
                  onChangeText={(text) => { houseNameRef.current = text; }}
                />
              </View>

              {/* Role Presets */}
              <View style={styles.field}>
                <View style={styles.fieldHeader}>
                  <Users size={16} color={primaryColor} />
                  <ThemedText style={styles.label}>House Roles</ThemedText>
                </View>
                <ThemedText style={[styles.hint, { color: mutedColor }]}>
                  Choose a preset or create your own
                </ThemedText>
                <View style={styles.presetsRow}>
                  {PRESETS.map(preset => {
                    const isSelected = selectedPreset === preset.id;
                    const color = PRESET_COLORS[preset.id];
                    return (
                      <Pressable
                        key={preset.id}
                        onPress={() => handleSelectPreset(preset)}
                        style={[
                          styles.presetCard,
                          { borderColor: isSelected ? color : borderColor },
                          isSelected && { backgroundColor: `${color}12` },
                        ]}
                      >
                        <View style={[styles.presetIcon, { backgroundColor: isSelected ? color : `${color}40` }]}>
                          {preset.icon}
                        </View>
                        <ThemedText style={[styles.presetLabel, isSelected && { color, fontWeight: '700' }]}>
                          {preset.label}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Preset role chips (read-only preview for non-custom) */}
                {selectedPreset !== 'custom' && (
                  <View style={styles.presetRolesRow}>
                    {roles.map(role => (
                      <View key={role} style={[styles.presetRoleChip, { backgroundColor: `${PRESET_COLORS[selectedPreset]}15`, borderColor: `${PRESET_COLORS[selectedPreset]}40` }]}>
                        <ThemedText style={[styles.presetRoleText, { color: PRESET_COLORS[selectedPreset] }]}>{role}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Custom tag input */}
                {selectedPreset === 'custom' && (
                  <>
                    <ThemedText style={[styles.hint, { color: mutedColor, marginTop: spacing.xs }]}>
                      Type a role and press Enter or use a comma
                    </ThemedText>
                    <TagInput tags={roles} onChange={setRoles} />
                  </>
                )}
              </View>

            </ThemedCard>

            <ThemedButton
              onPress={async () => {
                if (!houseNameRef.current.trim()) {
                  Alert.alert("Missing Name", "Please enter a house name.");
                  return;
                }
                setLoading(true);
                const { data, error } = await createHouse(houseNameRef.current.trim(), roles);
                setLoading(false);
                if (data) {
                  router.replace("/(tabs)");
                } else {
                  Alert.alert("Error Creating House", error?.message);
                }
              }}
              title={loading ? "Creating..." : "Create House"}
              disabled={loading}
              style={styles.button}
            />
            </>}

          </ScrollView>
        </KeyboardAvoidingView>
      </ThemedView>
    </>
  );

}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { paddingTop: 60, paddingBottom: 44, paddingHorizontal: spacing.xl, alignItems: 'center', gap: spacing.sm },
  heroLogo: { width: 150, height: 56, marginBottom: spacing.sm },
  heroTitle: { fontSize: 26, fontWeight: '800', color: 'white', textAlign: 'center' },
  heroSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center' },
  sheetWrapper: { flex: 1, marginTop: -28 },
  scroll: { flexGrow: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing['5xl'] },
  title: { fontSize: 24, fontWeight: '800', marginBottom: spacing.sm },
  subtitle: { fontSize: 14, lineHeight: 20, marginBottom: spacing.lg },
  card: { gap: spacing.lg, marginBottom: spacing.lg },
  field: { gap: spacing.xs },
  fieldHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  label: { fontWeight: '700', fontSize: 15 },
  hint: { fontSize: 12, marginBottom: spacing.xs },
  presetsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  presetCard: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: 12, borderWidth: 1.5 },
  presetIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  presetLabel: { fontSize: 13, fontWeight: '500' },
  presetRolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  presetRoleChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  presetRoleText: { fontSize: 13, fontWeight: '600' },
  button: { marginTop: spacing.sm },
  modeToggle: { flexDirection: 'row', borderWidth: 1, borderRadius: 12, overflow: 'hidden', marginBottom: spacing.lg },
  modeTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.xs, paddingVertical: spacing.sm + 2 },
  modeTabText: { fontSize: 13, fontWeight: '700' },
  codeInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2, fontSize: 15, fontFamily: 'monospace' },
});
