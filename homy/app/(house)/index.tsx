import {
  Text,
  StyleSheet,
  Alert
} from "react-native";
import { useHouse } from "@/context/house";
import { Stack, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { ThemedInput } from "@/components/themed-input";
import { ThemedButton } from '@/components/themed-button'
import { MainView, ThemedView } from '@/components/themed-view';
import Tags from "react-native-tags";
import { ThemedText } from "@/components/themed-text";

export default function CreateHouse() {
  const { createHouse } = useHouse();
  const router = useRouter();
  const houseNameRef = useRef("");
  const [roles, setRoles] = useState<string[]>([]);

  return (
    <>
      <MainView>
        <ThemedView>
          <Text style={styles.label}>House Name</Text>
          <ThemedInput
            type="text"
            placeholder="House Name"
            autoCapitalize="none"
            nativeID="house_name"
            onChangeText={(text) => {
              houseNameRef.current = text;
            }}
          />
        </ThemedView>
        <ThemedView>
          <Text style={styles.label}>House Roles</Text>
          <Tags
            textInputProps={{
              placeholder: "Roles (e.g parent, child...)"
            }}
            onChangeTags={setRoles}
            createTagOnReturn
            createTagOnString={[",", "."]}
            renderTag={({ tag, index, onPress, deleteTagOnPress, readonly }) => (
              <ThemedText key={`${tag}-${index}`}>{tag}</ThemedText>
            )}
          />
        </ThemedView>
        <ThemedButton
          onPress={async () => {
            const { data, error } = await createHouse(
              houseNameRef.current,
              roles
            );
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
  label: {
    marginBottom: 4,
    color: "#455fff",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
  },
});