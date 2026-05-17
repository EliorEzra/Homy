import React from 'react';
import { StyleSheet, View, Switch, ScrollView, Appearance } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedCard } from '@/components/themed-card';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/context/auth';
import { spacing } from '@/theme/theme';
import { User, Moon, Sun } from 'lucide-react-native';

function SectionHeader({ title }: { title: string }) {
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  return (
    <ThemedText style={[styles.sectionHeader, { color: mutedColor }]}>
      {title.toUpperCase()}
    </ThemedText>
  );
}

function SettingRow({ icon, label, right }: { icon: React.ReactNode; label: string; right?: React.ReactNode }) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIcon}>{icon}</View>
        <ThemedText style={styles.settingLabel}>{label}</ThemedText>
      </View>
      {right && <View>{right}</View>}
    </View>
  );
}

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const userName = user?.name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userInitials = userName.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ThemedView style={styles.container}>
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <ThemedCard variant="elevated" style={styles.profileCard}>
        <View style={[styles.avatarCircle, { backgroundColor: primaryColor }]}>
          <ThemedText style={styles.avatarText}>{userInitials}</ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText type="defaultSemiBold" style={styles.profileName}>{userName}</ThemedText>
          <ThemedText style={[styles.profileEmail, { color: mutedColor }]}>{userEmail}</ThemedText>
        </View>
      </ThemedCard>

      <ThemedDivider style={styles.divider} />

      <SectionHeader title="Appearance" />
      <ThemedCard variant="elevated" style={styles.sectionCard}>
        <SettingRow
          icon={isDark ? <Moon size={20} color={primaryColor} /> : <Sun size={20} color={primaryColor} />}
          label="Dark Mode"
          right={
            <Switch
              value={isDark}
              onValueChange={v => Appearance.setColorScheme(v ? 'dark' : 'light')}
              trackColor={{ false: '#ccc', true: primaryColor }}
              thumbColor="white"
            />
          }
        />
      </ThemedCard>

      <ThemedDivider style={styles.divider} />

      <SectionHeader title="Account" />
      <ThemedCard variant="elevated" style={styles.sectionCard}>
        <SettingRow
          icon={<User size={20} color={primaryColor} />}
          label={userName}
          right={<ThemedText style={[styles.settingValue, { color: mutedColor }]}>{userEmail}</ThemedText>}
        />
      </ThemedCard>

      <ThemedButton
        title="Sign Out"
        onPress={async () => { await signOut(); }}
        style={styles.signOutButton}
      />
    </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  profileCard: { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, gap: spacing.lg },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, marginBottom: 2 },
  profileEmail: { fontSize: 13 },
  divider: { marginVertical: spacing.lg },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.sm, marginLeft: spacing.xs },
  sectionCard: { padding: spacing.sm },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm, paddingHorizontal: spacing.sm },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  settingIcon: { width: 32, alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingValue: { fontSize: 13 },
  signOutButton: { marginTop: spacing.xl, backgroundColor: '#ff3748' },
});
