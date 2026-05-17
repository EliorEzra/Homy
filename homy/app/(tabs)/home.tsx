import { Alert, StyleSheet } from 'react-native';
import { useRef } from 'react';
import { ThemedText } from '@/components/themed-text';
import { MainView, ThemedView } from '@/components/themed-view';
import { useAuth } from '../../context/auth';
import { ThemedInput } from '@/components/themed-input';
import { useHouse } from '@/context/house';
import { ThemedButton } from '@/components/themed-button';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  const { addUser } = useHouse();
  const emailRef = useRef("");
  return (
    <MainView>
      <ThemedText type="title">Homy app</ThemedText>
      <ThemedView style={styles.separator} />
      <ThemedText onPress={() => signOut()}>Sign Out - {user?.email}</ThemedText>
      <ThemedView style={styles.separator} />
      <ThemedView>
        <ThemedText type='defaultSemiBold'>Invite Email</ThemedText>
        <ThemedInput 
          type="email"
            placeholder="email"
            autoCapitalize="none"
            nativeID="email"
            onChangeText={(text) => {
              emailRef.current = text;
            }}
        />
        <ThemedButton 
          title='invite'
          onPress={async () => {
            const { data, error } = await addUser(
              emailRef.current,
              []
            );
            if (data) {
              console.log('invited', emailRef.current);
            } else {
              console.log(error);
              Alert.alert("Login Error", error?.message);
            }
          }}
        />
      </ThemedView>
    </MainView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});