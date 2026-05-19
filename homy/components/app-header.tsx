import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { Home, Settings } from 'lucide-react-native';
import { spacing } from '@/theme/theme';

export function AppHeader() {
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const router = useRouter();

  return (
    <ThemedView style={styles.header}>
      <View style={styles.logo}>
        <View style={[styles.logoIcon, { backgroundColor: primaryColor }]}>
          <Home size={16} color="white" strokeWidth={2.5} />
        </View>
        <ThemedText style={styles.logoText}>HOMY</ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.push('/(tabs)/settings')}>
          <Settings size={22} color={primaryColor} />
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(0,0,0,0.08)' },
  logo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoIcon: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 18, fontWeight: '800', letterSpacing: 1.5 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: 6 },
});
