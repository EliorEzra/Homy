import { Text, StyleSheet, Alert, View, TextInput, Pressable } from "react-native";
import { useHouse } from "@/context/house";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from '@/components/themed-button';
import { MainView, ThemedView } from '@/components/themed-view';
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";
import { X } from "lucide-react-native";

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
            <Text style={[tagStyles.tagText, { color: primaryColor }]}>{tag}</Text>
            <Pressable onPress={() => onChange(tags.filter(t => t !== tag))} hitSlop={4}>
              <X size={12} color={primaryColor} />
            </Pressable>
          </View>
        ))}
        <TextInput
          style={[tagStyles.input, { color: textColor, minWidth: 120 }]}
          placeholder="Roles (e.g. parent, child...)"
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
  container: { borderWidth: 1, borderRadius: 8, padding: 8, minHeight: 48 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 14, borderWidth: 1 },
  tagText: { fontSize: 13, fontWeight: '600' },
  input: { fontSize: 14, paddingVertical: 4, flex: 1 },
});

export default function CreateHouse() {
  const { createHouse } = useHouse();
  const router = useRouter();
  const houseNameRef = useRef("");
  const [roles, setRoles] = useState<string[]>([]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <MainView>
        <ThemedView>
          <Text style={styles.label}>House Name</Text>
          <ThemedInput
            type="text"
            placeholder="House Name"
            autoCapitalize="none"
            nativeID="house_name"
            onChangeText={(text) => { houseNameRef.current = text; }}
          />
        </ThemedView>
        <ThemedView>
          <Text style={styles.label}>House Roles</Text>
          <TagInput tags={roles} onChange={setRoles} />
        </ThemedView>
        <ThemedButton
          onPress={async () => {
            const { data, error } = await createHouse(houseNameRef.current, roles);
            if (data) {
              router.replace("/(tabs)/home");
            } else {
              console.log(error);
              Alert.alert("Error Creating House", error?.message);
            }
          }}
          title="Create House"
          textStyle={styles.buttonText}
        />
      </MainView>
    </>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: 4, color: "#455fff" },
  buttonText: { color: "white", textAlign: "center", fontSize: 16 },
});
