import { StyleSheet, Alert, View, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
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
import { Home, X, Users, Heart, Coffee, Pencil } from "lucide-react-native";

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
  family: '#ff5c02',
  roommates: '#4d00ff',
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
  const { createHouse } = useHouse();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const houseNameRef = useRef("");
  const [selectedPreset, setSelectedPreset] = useState<string>('family');
  const [roles, setRoles] = useState<string[]>(PRESETS[0].roles);
  const [loading, setLoading] = useState(false);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPreset(preset.id);
    if (preset.id !== 'custom') setRoles(preset.roles);
    else setRoles([]);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

            {/* Header */}
            <View style={styles.logoSection}>
              <View style={[styles.logoIcon, { backgroundColor: primaryColor }]}>
                <Home size={32} color="white" />
              </View>
              <ThemedText style={styles.logoText}>HOMY</ThemedText>
              <ThemedText style={[styles.tagline, { color: mutedColor }]}>Set up your household</ThemedText>
            </View>

            <ThemedText style={styles.title}>Create a House</ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedColor }]}>
              Give your home a name and define the roles for your household members.
            </ThemedText>

            {/* Form */}
            <ThemedCard variant="elevated" style={styles.card}>

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
                  router.replace("/(tabs)/home");
                } else {
                  Alert.alert("Error Creating House", error?.message);
                }
              }}
              title={loading ? "Creating..." : "Create House"}
              disabled={loading}
              style={styles.button}
            />

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
  hint: { fontSize: 12, marginBottom: spacing.xs },
  presetsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  presetCard: { flex: 1, alignItems: 'center', gap: spacing.xs, paddingVertical: spacing.md, borderRadius: 12, borderWidth: 1.5 },
  presetIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  presetLabel: { fontSize: 13, fontWeight: '500' },
  presetRolesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: spacing.xs },
  presetRoleChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  presetRoleText: { fontSize: 13, fontWeight: '600' },
  button: { marginTop: spacing.sm },
});
