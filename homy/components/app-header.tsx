import { View, Image, Pressable, StyleSheet, Text, useColorScheme, ImageSourcePropType } from 'react-native';
import { ThemedView } from './themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { spacing } from '@/theme/theme';

export function AppHeader() {
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const textColor = useThemeColor({}, 'text');
  const router = useRouter();
  const isDark = useColorScheme() === 'dark';

  return (
    <ThemedView style={styles.header}>
      <Image
        source={require('@/assets/images/logoHomy.png') as ImageSourcePropType}
        style={[styles.logo, isDark && { tintColor: '#ffffff' }]}
        resizeMode="contain"
      />
      <Text style={[styles.brand, { color: textColor }]}>HOMY</Text>
      <View style={{ flex: 1 }} />
      <Pressable style={styles.iconBtn} hitSlop={8} onPress={() => router.push('/(tabs)/settings')}>
        <Settings size={22} color={primaryColor} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  logo: { height: 40, width: 40 },
  brand: { fontSize: 18, fontWeight: '900', letterSpacing: 2, marginLeft: spacing.sm },
  iconBtn: { padding: 6 },
});
