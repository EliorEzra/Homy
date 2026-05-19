import { StyleSheet, View, Switch, ScrollView, Pressable, Appearance } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedCard } from '@/components/themed-card';
import { ThemedButton } from '@/components/themed-button';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { spacing } from '@/theme/theme';
import { useColorScheme } from 'react-native';
import { User, Moon, LogOut, ChevronRight } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const isDark = colorScheme === 'dark';

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const toggleDarkMode = (val: boolean) => {
    Appearance.setColorScheme(val ? 'dark' : 'light');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
        </View>
        <ThemedCard variant="elevated" style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{displayName}</ThemedText>
            <ThemedText style={[styles.profileEmail, { color: mutedColor }]}>{user?.email}</ThemedText>
          </View>
        </ThemedCard>

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          <View style={[styles.settingRow, { borderBottomColor: borderColor }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: `${primaryColor}20` }]}>
                <Moon size={18} color={primaryColor} />
              </View>
              <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleDarkMode}
              trackColor={{ false: '#ccc', true: primaryColor }}
              thumbColor="white"
            />
          </View>
        </ThemedCard>

        <ThemedDivider style={styles.divider} />

        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          <Pressable
            style={styles.settingRow}
            onPress={async () => { await signOut(); }}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#ff374820' }]}>
                <LogOut size={18} color="#ff3748" />
              </View>
              <ThemedText style={[styles.settingLabel, { color: '#ff3748' }]}>Sign Out</ThemedText>
            </View>
            <ChevronRight size={18} color={mutedColor} />
          </Pressable>
        </ThemedCard>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: spacing.xl * 2 },
  sectionHeader: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  profileCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 20 },
  profileInfo: { flex: 1 },
  profileName: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  profileEmail: { fontSize: 13 },
  settingsCard: { marginHorizontal: spacing.lg, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 0 },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  divider: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
});
