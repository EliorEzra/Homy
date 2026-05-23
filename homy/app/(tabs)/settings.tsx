import { StyleSheet, View, Switch, ScrollView, Pressable, Appearance, Alert, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedCard } from '@/components/themed-card';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { spacing } from '@/theme/theme';
import { useColorScheme } from 'react-native';
import { useState } from 'react';
import { Models } from 'react-native-appwrite';
import { Moon, LogOut, ChevronRight, Trash2, DoorOpen, Users, Crown, UserPlus, X, Mail, Copy, Check, Pencil, RefreshCw, UserMinus } from 'lucide-react-native';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { house, houseTeamId, leaveHouse, deleteHouse, addUser, members, changeUserRoles, removeMember, refreshMembers, houseRoles } = useHouse();
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const isDark = colorScheme === 'dark';

  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteTab, setInviteTab] = useState<'email' | 'code'>('email');
  const [roleEditMember, setRoleEditMember] = useState<Models.Membership | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [savingRole, setSavingRole] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // Format teamId as readable groups: e.g. ABCDE-FGHIJ-KLMNO-PQRST
  const houseCode = houseTeamId
    ? houseTeamId.toUpperCase().match(/.{1,5}/g)?.join('-') ?? houseTeamId
    : null;

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();

  const isOwner = house?.roles?.includes('owner') ?? false;

  const handleCopyCode = async () => {
    if (!houseTeamId) return;
    await Clipboard.setStringAsync(houseTeamId);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const toggleDarkMode = (val: boolean) => {
    Appearance.setColorScheme(val ? 'dark' : 'light');
  };

  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }
    setInviting(true);
    const { error } = await addUser(email);
    setInviting(false);
    if (error) {
      Alert.alert('Invite Failed', error.message);
    } else {
      setInviteEmail('');
      setInviteVisible(false);
      Alert.alert('Invite Sent', `An invitation has been sent to ${email}.`);
    }
  };

  const handleRefreshMembers = async () => {
    setRefreshing(true);
    await refreshMembers();
    setRefreshing(false);
  };

  const handleRemoveMember = (member: Models.Membership) => {
    const name = member.userName || member.userEmail?.split('@')[0] || 'this member';
    Alert.alert(
      'Remove Member',
      `Remove ${name} from the household? They will lose access to all shared data.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const { error } = await removeMember(member.$id);
            if (error) Alert.alert('Error', error.message);
          },
        },
      ]
    );
  };

  const openRoleEdit = (member: Models.Membership) => {
    const currentRole = (member.roles ?? []).filter((r: string) => r !== 'owner')[0] ?? '';
    setSelectedRole(currentRole);
    setRoleEditMember(member);
  };

  const handleSaveRole = async () => {
    if (!roleEditMember) return;
    setSavingRole(true);
    const newRoles = selectedRole ? [selectedRole] : [];
    const { error } = await changeUserRoles(roleEditMember.$id, newRoles);
    setSavingRole(false);
    if (error) {
      Alert.alert('Error', error.message);
    } else {
      setRoleEditMember(null);
    }
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
            <Pressable onPress={handleRefreshMembers} disabled={refreshing} style={[styles.iconBtn, { backgroundColor: `${primaryColor}20` }]}>
              <RefreshCw size={14} color={primaryColor} style={refreshing ? { opacity: 0.4 } : undefined} />
            </Pressable>
            {isOwner && (
              <Pressable onPress={() => setInviteVisible(true)} style={[styles.inviteBtn, { backgroundColor: `${primaryColor}20` }]}>
                <UserPlus size={14} color={primaryColor} />
                <ThemedText style={[styles.inviteBtnText, { color: primaryColor }]}>Invite</ThemedText>
              </Pressable>
            )}
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

            const customRoles = (member.roles ?? []).filter((r: string) => r !== 'owner');

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
                  {memberIsOwner ? (
                    <ThemedText style={[styles.memberRoleChipText, { color: primaryColor }]}>Owner</ThemedText>
                  ) : customRoles.length > 0 ? (
                    <View style={styles.memberRoleChipRow}>
                      {customRoles.map((r: string) => (
                        <View key={r} style={[styles.memberRoleChip, { backgroundColor: `${primaryColor}15`, borderColor: `${primaryColor}40` }]}>
                          <ThemedText style={[styles.memberRoleChipText, { color: primaryColor }]}>{r}</ThemedText>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <ThemedText style={[styles.memberEmail, { color: mutedColor }]}>No role assigned</ThemedText>
                  )}
                </View>
                {isOwner && !memberIsOwner && (
                  <View style={styles.memberActions}>
                    <Pressable onPress={() => openRoleEdit(member)} hitSlop={8} style={[styles.iconBtn, { backgroundColor: `${primaryColor}15` }]}>
                      <Pencil size={14} color={primaryColor} />
                    </Pressable>
                    <Pressable onPress={() => handleRemoveMember(member)} hitSlop={8} style={[styles.iconBtn, { backgroundColor: '#ff374815' }]}>
                      <UserMinus size={14} color="#ff3748" />
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </ThemedCard>

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

      {/* Role Edit Modal */}
      <Modal
        visible={!!roleEditMember}
        animationType="slide"
        transparent
        onRequestClose={() => setRoleEditMember(null)}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Assign Role</ThemedText>
              <Pressable onPress={() => setRoleEditMember(null)} hitSlop={8}>
                <X size={24} color={primaryColor} />
              </Pressable>
            </View>
            <View style={styles.modalBody}>
              <ThemedText style={[styles.modalHint, { color: mutedColor }]}>
                {roleEditMember ? (() => {
                  const isMe2 = roleEditMember.userId === user?.$id;
                  return isMe2 ? 'Your role' : (roleEditMember.userName || roleEditMember.userEmail?.split('@')[0] || 'This member');
                })() : ''}
              </ThemedText>

              {houseRoles.length === 0 ? (
                <ThemedText style={[styles.modalHint, { color: mutedColor }]}>
                  This house has no defined roles. You can still remove any existing role.
                </ThemedText>
              ) : (
                <View style={styles.roleChipsWrap}>
                  {/* "No role" chip */}
                  <Pressable
                    onPress={() => setSelectedRole('')}
                    style={[
                      styles.roleChip,
                      { borderColor },
                      selectedRole === '' && { backgroundColor: `${primaryColor}20`, borderColor: primaryColor },
                    ]}
                  >
                    <ThemedText style={[styles.roleChipText, selectedRole === '' && { color: primaryColor, fontWeight: '700' }]}>
                      No role
                    </ThemedText>
                  </Pressable>
                  {houseRoles.map((r: string) => (
                    <Pressable
                      key={r}
                      onPress={() => setSelectedRole(r)}
                      style={[
                        styles.roleChip,
                        { borderColor },
                        selectedRole === r && { backgroundColor: `${primaryColor}20`, borderColor: primaryColor },
                      ]}
                    >
                      <ThemedText style={[styles.roleChipText, selectedRole === r && { color: primaryColor, fontWeight: '700' }]}>
                        {r}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.modalFooter}>
              <Pressable onPress={() => setRoleEditMember(null)} style={[styles.footerBtn, { borderColor }]}>
                <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveRole}
                disabled={savingRole}
                style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: savingRole ? 0.6 : 1 }]}
              >
                <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>
                  {savingRole ? 'Saving…' : 'Save'}
                </ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* Invite Member Modal */}
      <Modal
        visible={inviteVisible}
        animationType="slide"
        transparent
        onRequestClose={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>

              {/* Header */}
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Invite Member</ThemedText>
                <Pressable onPress={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>

              {/* Tabs */}
              <View style={[styles.modalTabs, { borderColor }]}>
                <Pressable
                  style={[styles.modalTab, inviteTab === 'email' && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
                  onPress={() => setInviteTab('email')}
                >
                  <Mail size={15} color={inviteTab === 'email' ? primaryColor : mutedColor} />
                  <ThemedText style={[styles.modalTabText, { color: inviteTab === 'email' ? primaryColor : mutedColor }]}>
                    By Email
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={[styles.modalTab, inviteTab === 'code' && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]}
                  onPress={() => setInviteTab('code')}
                >
                  <Copy size={15} color={inviteTab === 'code' ? primaryColor : mutedColor} />
                  <ThemedText style={[styles.modalTabText, { color: inviteTab === 'code' ? primaryColor : mutedColor }]}>
                    By Code
                  </ThemedText>
                </Pressable>
              </View>

              {/* Email tab */}
              {inviteTab === 'email' && (
                <>
                  <View style={styles.modalBody}>
                    <ThemedText style={[styles.modalHint, { color: mutedColor }]}>
                      They will receive an email invitation to join your household.
                    </ThemedText>
                    <View style={[styles.emailRow, { borderColor, backgroundColor: inputBg }]}>
                      <Mail size={18} color={mutedColor} />
                      <TextInput
                        style={[styles.emailInput, { color: textColor }]}
                        placeholder="Enter email address"
                        placeholderTextColor={mutedColor}
                        value={inviteEmail}
                        onChangeText={setInviteEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoFocus
                      />
                    </View>
                  </View>
                  <View style={styles.modalFooter}>
                    <Pressable
                      onPress={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }}
                      style={[styles.footerBtn, { borderColor }]}
                    >
                      <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                    </Pressable>
                    <Pressable
                      onPress={handleInvite}
                      disabled={inviting}
                      style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: inviting ? 0.6 : 1 }]}
                    >
                      <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>
                        {inviting ? 'Sending…' : 'Send Invite'}
                      </ThemedText>
                    </Pressable>
                  </View>
                </>
              )}

              {/* Code tab */}
              {inviteTab === 'code' && (
                <View style={styles.modalBody}>
                  <ThemedText style={[styles.modalHint, { color: mutedColor }]}>
                    Share this code — anyone who enters it in the Join a House screen will be added instantly, no email needed.
                  </ThemedText>
                  <View style={[styles.codeBox, { borderColor, backgroundColor: inputBg }]}>
                    <ThemedText style={[styles.codeText, { color: primaryColor }]}>{houseCode}</ThemedText>
                    <Pressable onPress={handleCopyCode} style={[styles.copyBtn, { backgroundColor: `${primaryColor}20` }]}>
                      {codeCopied
                        ? <Check size={18} color="#1fc16b" />
                        : <Copy size={18} color={primaryColor} />}
                    </Pressable>
                  </View>
                  {codeCopied && (
                    <ThemedText style={[styles.copiedHint, { color: '#1fc16b' }]}>Copied to clipboard!</ThemedText>
                  )}
                </View>
              )}

            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  memberRoleChipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  memberRoleChip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, borderWidth: 1 },
  memberRoleChipText: { fontSize: 11, fontWeight: '600' },
  memberActions: { flexDirection: 'row', gap: spacing.xs },
  iconBtn: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  roleChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  roleChipText: { fontSize: 14, fontWeight: '500' },
  emptyMembers: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyMembersText: { fontSize: 14 },
  divider: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  codeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.md },
  codeText: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace' },
  copyBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  copiedHint: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: spacing.xs },
  modalTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  modalTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm + 2 },
  modalTabText: { fontSize: 13, fontWeight: '700' },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 10, marginLeft: 'auto' },
  inviteBtnText: { fontSize: 12, fontWeight: '700' },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.md },
  modalHint: { fontSize: 14, lineHeight: 20 },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  emailInput: { flex: 1, fontSize: 15 },
  modalFooter: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '700', fontSize: 15 },
});
