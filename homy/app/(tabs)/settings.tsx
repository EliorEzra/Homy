import { StyleSheet, View, Switch, ScrollView, Pressable, Appearance, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedCard } from '@/components/themed-card';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { spacing } from '@/theme/theme';
import { useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { Models } from 'react-native-appwrite';
import { Moon, LogOut, ChevronRight, Trash2, DoorOpen, Users, Crown } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { house, houseTeamId, getUsers, leaveHouse, deleteHouse } = useHouse();
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const isDark = colorScheme === 'dark';

  const [members, setMembers] = useState<Models.Membership[]>([]);

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const isOwner = house?.roles?.includes('owner') ?? false;

  useEffect(() => {
    if (!houseTeamId) return;
    getUsers().then(({ data }) => {
      if (data) setMembers(data.memberships);
    });
  }, [houseTeamId]);

  const toggleDarkMode = (val: boolean) => {
    Appearance.setColorScheme(val ? 'dark' : 'light');
  };

  const handleLeaveHouse = () => {
    Alert.alert(
      'Leave House',
      'Are you sure you want to leave this household? You will lose access to all shared data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            const { error } = await leaveHouse();
            if (error) Alert.alert('Error', error.message);
          },
        },
      ]
    );
  };

  const handleCloseHouse = () => {
    Alert.alert(
      'Close House',
      'Are you sure you want to permanently close this household? This will remove all members and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Close House',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteHouse();
            if (error) Alert.alert('Error', error.message);
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Profile */}
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
            {isOwner && (
              <View style={[styles.ownerBadge, { backgroundColor: `${primaryColor}20` }]}>
                <ThemedText style={[styles.ownerBadgeText, { color: primaryColor }]}>Owner</ThemedText>
              </View>
            )}
          </View>
        </ThemedCard>

        {/* Appearance */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          <View style={styles.settingRow}>
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

        {/* Household Members */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <ThemedText style={styles.sectionTitle}>Household Members</ThemedText>
            <View style={[styles.memberCount, { backgroundColor: `${primaryColor}20` }]}>
              <ThemedText style={[styles.memberCountText, { color: primaryColor }]}>{members.length}</ThemedText>
            </View>
          </View>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          {members.length === 0 ? (
            <View style={styles.emptyMembers}>
              <Users size={24} color={mutedColor} opacity={0.5} />
              <ThemedText style={[styles.emptyMembersText, { color: mutedColor }]}>No members yet</ThemedText>
            </View>
          ) : members.map((member, index) => {
            const isMe = member.userId === user?.$id;
            const memberIsOwner = member.roles?.includes('owner');
            const isLast = index === members.length - 1;

            // Appwrite doesn't populate userName/userEmail on memberships in this version,
            // so use auth context for the current user and userId as fallback for others.
            const name = isMe
              ? (user?.name || user?.email?.split('@')[0] || 'Me')
              : (member.userName || member.userEmail?.split('@')[0] || `User ${(member.userId as string).slice(0, 6)}`);
            const email = isMe
              ? (user?.email || '')
              : (member.userEmail || '');
            const memberInitials = name.slice(0, 2).toUpperCase();

            return (
              <View
                key={member.$id}
                style={[
                  styles.memberRow,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor },
                ]}
              >
                <View style={[styles.memberAvatar, { backgroundColor: memberIsOwner ? primaryColor : `${primaryColor}40` }]}>
                  <ThemedText style={styles.memberAvatarText}>{memberInitials}</ThemedText>
                </View>
                <View style={styles.memberInfo}>
                  <View style={styles.memberNameRow}>
                    <ThemedText style={styles.memberName}>{name}{isMe ? ' (you)' : ''}</ThemedText>
                    {memberIsOwner && <Crown size={13} color={primaryColor} />}
                  </View>
                  {!!email && <ThemedText style={[styles.memberEmail, { color: mutedColor }]}>{email}</ThemedText>}
                  {member.roles && member.roles.filter((r: string) => r !== 'owner').length > 0 && (
                    <ThemedText style={[styles.memberRoles, { color: mutedColor }]}>
                      {member.roles.filter((r: string) => r !== 'owner').join(', ')}
                    </ThemedText>
                  )}
                </View>
              </View>
            );
          })}
        </ThemedCard>

        <ThemedDivider style={styles.divider} />

        {/* Household Actions */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Household</ThemedText>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          {isOwner ? (
            <Pressable style={styles.settingRow} onPress={handleCloseHouse}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#ff374820' }]}>
                  <Trash2 size={18} color="#ff3748" />
                </View>
                <View>
                  <ThemedText style={[styles.settingLabel, { color: '#ff3748' }]}>Close House</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: mutedColor }]}>Permanently deletes the household</ThemedText>
                </View>
              </View>
              <ChevronRight size={18} color={mutedColor} />
            </Pressable>
          ) : (
            <Pressable style={styles.settingRow} onPress={handleLeaveHouse}>
              <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: '#ff374820' }]}>
                  <DoorOpen size={18} color="#ff3748" />
                </View>
                <View>
                  <ThemedText style={[styles.settingLabel, { color: '#ff3748' }]}>Leave House</ThemedText>
                  <ThemedText style={[styles.settingSubtitle, { color: mutedColor }]}>Remove yourself from this household</ThemedText>
                </View>
              </View>
              <ChevronRight size={18} color={mutedColor} />
            </Pressable>
          )}
        </ThemedCard>

        <ThemedDivider style={styles.divider} />

        {/* Account */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Account</ThemedText>
        </View>
        <ThemedCard variant="outlined" style={styles.settingsCard}>
          <Pressable style={styles.settingRow} onPress={async () => { await signOut(); }}>
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
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  memberCount: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 10 },
  memberCountText: { fontSize: 12, fontWeight: '700' },
  profileCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 20 },
  profileInfo: { flex: 1 },
  profileName: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  profileEmail: { fontSize: 13, marginBottom: spacing.xs },
  ownerBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8, marginTop: spacing.xs },
  ownerBadgeText: { fontSize: 11, fontWeight: '700' },
  settingsCard: { marginHorizontal: spacing.lg, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingSubtitle: { fontSize: 12, marginTop: 1 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { color: 'white', fontWeight: '700', fontSize: 14 },
  memberInfo: { flex: 1 },
  memberNameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 2 },
  memberName: { fontWeight: '600', fontSize: 14 },
  memberEmail: { fontSize: 12, marginBottom: 1 },
  memberRoles: { fontSize: 11 },
  emptyMembers: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyMembersText: { fontSize: 14 },
  divider: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
});
