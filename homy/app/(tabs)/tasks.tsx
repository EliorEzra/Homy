import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { MainView, ThemedView } from '@/components/themed-view';

export default function HomeScreen() {
  return (
    <MainView>
      <ThemedText type="title">Homy Tasks</ThemedText>
      <ThemedView style={styles.separator}/>
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