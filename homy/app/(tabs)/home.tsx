import { StyleSheet } from 'react-native';
import { ThemedText as Text} from '@/components/themed-text';
import { ThemedView as View} from '@/components/themed-view';
import { useAuth } from '../context/auth';

export default function HomeScreen() {
  const { signOut, user } = useAuth();
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Homy app</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text onPress={() => signOut()}>Sign Out - {user?.email}</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
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