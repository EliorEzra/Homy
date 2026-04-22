import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MainView, ThemedView } from '@/components/themed-view';
import { useAuth } from '../context/auth';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  return (
    <MainView>
      <ThemedText type="title">Homy app</ThemedText>
      <ThemedView style={styles.separator} />
      <ThemedText onPress={() => signOut()}>Sign Out - {user?.email}</ThemedText>
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