import {
  StyleSheet, View, Switch, ScrollView, Pressable, Appearance, Alert,
  TextInput, Modal, KeyboardAvoidingView, Platform,
 useColorScheme } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedCard } from '@/components/themed-card';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '@/context/auth';
import { useHouse } from '@/context/house';
import { spacing } from '@/theme/theme';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Models } from 'react-native-appwrite';
import { RolePermissions, DEFAULT_ROLE_PERMISSIONS, TabPermission } from '@/context/db_models';
import {
  Moon, LogOut, ChevronRight, Trash2, DoorOpen, Users, Crown, UserPlus, X,
  Mail, Copy, Check, Pencil, RefreshCw, UserMinus, ShieldCheck, ChevronUp,
  ChevronDown, Plus, Lock, Eye, EyeOff, User,
  Home, Heart, Star, Sun, Coffee, Music, Leaf, Globe, Smile, Zap, Gift,
  Rocket, Flame, Snowflake, Cat, Bike,
  LucideProps,
} from 'lucide-react-native';
import { UserPreferences } from '@/context/prefs';

// ─── Avatar preset colours ────────────────────────────────────────────────────
const AVATAR_COLORS = ['#106d8f','#1a5276','#0d7ea8','#61b2cf','#1a8fad','#2c3e50','#8e44ad','#c47c2a'];

// ─── Avatar icons ─────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.FC<LucideProps & React.RefAttributes<SVGSVGElement>>> = {
  Home, Heart, Star, Sun, Moon, Coffee, Music, Crown, Leaf, Globe,
  Smile, Zap, Gift, Rocket, Flame, Snowflake, Cat, Bike,
};
const AVATAR_ICON_LIST = Object.keys(ICON_MAP);

function AvatarIcon({ name, size, color }: { name: string; size: number; color: string }) {
  const IconComp = ICON_MAP[name];
  if (!IconComp) return null;
  return <IconComp size={size} color={color} strokeWidth={2} />;
}

export default function SettingsScreen() {
  const { user, signOut, updateName, updatePassword, updatePrefs } = useAuth();
  const { house, houseTeamId, leaveHouse, deleteHouse, addUser, members, changeUserRoles, removeMember, refreshMembers, houseRoles, roleOrder, rolePermissions, hierarchyEnabled, updateRolePermissions, updateRoleOrder, addRole, removeRole, updateHierarchyEnabled, transferOwnership } = useHouse();
  const colorScheme = useColorScheme();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'cardBackground');
  const isDark = colorScheme === 'dark';

  // ── Existing state ────────────────────────────────────────────────────────
  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteTab, setInviteTab] = useState<'email' | 'code'>('email');
  const [roleEditMember, setRoleEditMember] = useState<Models.Membership | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [savingRole, setSavingRole] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [permEditRole, setPermEditRole] = useState<string | null>(null);
  const [editingPerms, setEditingPerms] = useState<RolePermissions>(DEFAULT_ROLE_PERMISSIONS);
  const [savingPerms, setSavingPerms] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [addingRole, setAddingRole] = useState(false);

  // ── Profile edit state ────────────────────────────────────────────────────
  const [profileEditVisible, setProfileEditVisible] = useState(false);
  const [editName, setEditName] = useState('');
  const [editAvatarColor, setEditAvatarColor] = useState('');
  const [editAvatarIcon, setEditAvatarIcon] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [editOldPassword, setEditOldPassword] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');
  const [editConfirmPassword, setEditConfirmPassword] = useState('');
  const [showOldPw, setShowOldPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  // Refresh member names/avatars whenever this tab comes into focus.
  // Account-level changes (name, avatar prefs) don't emit membership events,
  // so a focus-based re-fetch is the reliable way to pick them up.
  useFocusEffect(
    useCallback(() => {
      refreshMembers().catch(() => {});
    }, [refreshMembers])
  );

  // ── Derived ───────────────────────────────────────────────────────────────
  const houseCode = houseTeamId
    ? houseTeamId.toUpperCase().match(/.{1,5}/g)?.join('-') ?? houseTeamId
    : null;

  const displayName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : user?.email?.split('@')[0] || 'User';
  const initials = displayName.slice(0, 2).toUpperCase();
  const avatarIcon = user?.prefs?.avatarIcon || '';
  const avatarColor = user?.prefs?.avatarColor || primaryColor;

  const isOwner = house?.roles?.includes('owner') ?? false;
  const effectiveOrder = roleOrder.length > 0 ? roleOrder : houseRoles;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleCopyCode = async () => {
    if (!houseTeamId) return;
    await Clipboard.setStringAsync(houseTeamId);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const toggleDarkMode = async (val: boolean) => {
    Appearance.setColorScheme(val ? 'dark' : 'light');
    await updatePrefs({ theme: val ? 'dark' : 'light' } as UserPreferences);
  };

  // ── Profile edit ──────────────────────────────────────────────────────────
  const openProfileEdit = () => {
    setEditName(user?.name ?? '');
    setEditAvatarColor((user?.prefs?.avatarColor as string) ?? '');
    setEditAvatarIcon((user?.prefs?.avatarIcon as string) ?? '');
    setEditOldPassword(''); setEditNewPassword(''); setEditConfirmPassword('');
    setShowPasswordSection(false);
    setShowOldPw(false); setShowNewPw(false); setShowConfirmPw(false);
    setProfileEditVisible(true);
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);

    // Name
    const trimmedName = editName.trim();
    if (trimmedName && trimmedName !== user?.name) {
      const { error } = await updateName(trimmedName);
      if (error) { setSavingProfile(false); Alert.alert('Error updating name', error?.message ?? String(error)); return; }
    }

    // Avatar colour + icon
    const prevColor = (user?.prefs?.avatarColor as string) ?? '';
    const prevIcon  = (user?.prefs?.avatarIcon  as string) ?? '';
    if (editAvatarColor !== prevColor || editAvatarIcon !== prevIcon) {
      await updatePrefs({ avatarColor: editAvatarColor, avatarIcon: editAvatarIcon } as UserPreferences);
    }

    // Password
    if (showPasswordSection && editNewPassword) {
      if (editNewPassword !== editConfirmPassword) {
        setSavingProfile(false); Alert.alert('Password Mismatch', 'New passwords do not match.'); return;
      }
      if (editNewPassword.length < 8) {
        setSavingProfile(false); Alert.alert('Weak Password', 'Password must be at least 8 characters.'); return;
      }
      if (!editOldPassword) {
        setSavingProfile(false); Alert.alert('Missing', 'Please enter your current password.'); return;
      }
      const { error } = await updatePassword(editNewPassword, editOldPassword);
      if (error) { setSavingProfile(false); Alert.alert('Error updating password', error?.message ?? String(error)); return; }
    }

    setSavingProfile(false);
    setProfileEditVisible(false);
  };

  // ── Other handlers (unchanged) ────────────────────────────────────────────
  const handleInvite = async () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) { Alert.alert('Invalid Email', 'Please enter a valid email address.'); return; }
    setInviting(true);
    const { error } = await addUser(email);
    setInviting(false);
    if (error) { Alert.alert('Invite Failed', error.message); }
    else { setInviteEmail(''); setInviteVisible(false); Alert.alert('Invite Sent', `An invitation has been sent to ${email}.`); }
  };

  const handleRefreshMembers = () => {
    setRefreshing(true);
    refreshMembers().catch(() => {});
    setRefreshing(false);
  };

  const handleRemoveMember = (member: Models.Membership) => {
    const name = member.userName || member.userEmail?.split('@')[0] || 'this member';
    Alert.alert('Remove Member', `Remove ${name} from the household? They will lose access to all shared data.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => { 
        removeMember(member.$id).then(({error}) => {
          if (error) Alert.alert('Error', error.message)
        }).catch(() => {})
      }},
    ]);
  };

  const handleTransferOwnership = (member: Models.Membership) => {
    const name = member.userName || member.userEmail?.split('@')[0] || 'this member';
    Alert.alert('Transfer Ownership', `Make ${name} the new owner? You will become a regular member.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Transfer', style: 'destructive', onPress: () => {
        transferOwnership(member.$id).then(({error}) => {
          if (error) Alert.alert('Error', error.message ?? 'Could not transfer ownership.'); 
        }).catch(() => {})
      }},
    ]);
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
    if (error) Alert.alert('Error', error.message);
    else setRoleEditMember(null);
  };

  const openPermEdit = (role: string) => {
    setEditingPerms(rolePermissions[role] ?? DEFAULT_ROLE_PERMISSIONS);
    setPermEditRole(role);
  };

  const togglePerm = (tab: keyof RolePermissions, key: keyof TabPermission) => {
    setEditingPerms(prev => ({ ...prev, [tab]: { ...prev[tab], [key]: !prev[tab][key] } }));
  };

  const handleSavePerms = async () => {
    if (!permEditRole) return;
    setSavingPerms(true);
    const { error } = await updateRolePermissions(permEditRole, editingPerms);
    setSavingPerms(false);
    if (error) Alert.alert('Error', error.message);
    else setPermEditRole(null);
  };

  const moveRole = async (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= effectiveOrder.length) return;
    const newOrder = [...effectiveOrder];
    [newOrder[index], newOrder[next]] = [newOrder[next], newOrder[index]];
    const { error } = await updateRoleOrder(newOrder);
    if (error) Alert.alert('Error', error.message);
  };

  const handleAddRole = async () => {
    const trimmed = newRoleName.trim();
    if (!trimmed) return;
    setAddingRole(true);
    const { error } = await addRole(trimmed);
    setAddingRole(false);
    if (error) Alert.alert('Error', error.message);
    else setNewRoleName('');
  };

  const handleRemoveRole = (role: string) => {
    Alert.alert('Remove Role', `Remove the "${role}" role? Members with this role will become unassigned.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        removeRole(role).then(({error}) => {
          if (error) Alert.alert('Error', error.message)
        }).catch(() => {})
      }},
    ]);
  };

  const handleLeaveHouse = () => {
    Alert.alert('Leave House', 'Are you sure you want to leave this household? You will lose access to all shared data.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => {
        leaveHouse().then(({error}) => {
          if (error) Alert.alert('Error', error.message)
        }).catch(() => {})
      }},
    ]);
  };

  const handleCloseHouse = () => {
    Alert.alert('Close House', 'Are you sure you want to permanently close this household? This will remove all members and cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Close House', style: 'destructive', onPress: () => {
        deleteHouse().then(({error}) => {
          if (error) Alert.alert('Error', error.message)
        }).catch(() => {})
      }},
    ]);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Profile ──────────────────────────────────────────────────────── */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Profile</ThemedText>
        </View>
        <ThemedCard variant="elevated" style={styles.profileCard}>
          {/* Avatar */}
          <Pressable onPress={openProfileEdit} style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
              {avatarIcon
                ? <AvatarIcon name={avatarIcon} size={26} color="white" />
                : <ThemedText style={styles.avatarText}>{initials}</ThemedText>
              }
            </View>
            <View style={[styles.avatarEditBadge, { backgroundColor: primaryColor }]}>
              <Pencil size={8} color="white" />
            </View>
          </Pressable>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{displayName}</ThemedText>
            <ThemedText style={[styles.profileEmail, { color: mutedColor }]}>{user?.email}</ThemedText>
            {isOwner && (
              <View style={[styles.ownerBadge, { backgroundColor: `${primaryColor}20` }]}>
                <ThemedText style={[styles.ownerBadgeText, { color: primaryColor }]}>Owner</ThemedText>
              </View>
            )}
          </View>
          <Pressable onPress={openProfileEdit} style={[styles.editProfileBtn, { backgroundColor: `${primaryColor}15` }]}>
            <Pencil size={15} color={primaryColor} />
          </Pressable>
        </ThemedCard>

        {/* ── Appearance ───────────────────────────────────────────────────── */}
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
            <Switch value={isDark} onValueChange={toggleDarkMode} trackColor={{ false: '#ccc', true: primaryColor }} thumbColor="white" />
          </View>
        </ThemedCard>

        <ThemedDivider style={styles.divider} />

        {/* ── Household Members ─────────────────────────────────────────────── */}
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
            const name = isMe
              ? (user?.name || user?.email?.split('@')[0] || 'Me')
              : (member.userName || member.userEmail?.split('@')[0] || `User ${(member.userId).slice(0, 6)}`);
            const email = isMe ? (user?.email || '') : (member.userEmail || '');
            const memberInitials = name.slice(0, 2).toUpperCase();
            const customRoles = (member.roles ?? []).filter((r: string) => r !== 'owner');
            // For the current user prefer live prefs; for others use what get-members returned.
            const memberAny = member;
            const memberIcon  = isMe
              ? (user?.prefs?.avatarIcon || '')
              : ((memberAny.avatarIcon    as string) || '');
            const memberColor = isMe
              ? ((user?.prefs?.avatarColor as string) || primaryColor)
              : ((memberAny.avatarColor   as string) || (memberIsOwner ? primaryColor : `${primaryColor}40`));
            return (
              <View key={member.$id} style={[styles.memberRow, !isLast && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                <View style={[styles.memberAvatar, { backgroundColor: memberColor }]}>
                  {memberIcon
                    ? <AvatarIcon name={memberIcon} size={18} color="white" />
                    : <ThemedText style={styles.memberAvatarText}>{memberInitials}</ThemedText>
                  }
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
                    <Pressable onPress={() => handleTransferOwnership(member)} hitSlop={8} style={[styles.iconBtn, { backgroundColor: '#c47c2a20' }]}>
                      <Crown size={14} color="#c47c2a" />
                    </Pressable>
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

        {/* ── Role Permissions (owner only) ─────────────────────────────────── */}
        {isOwner && (
          <>
            <ThemedDivider style={styles.divider} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <ShieldCheck size={18} color={primaryColor} />
                <ThemedText style={styles.sectionTitle}>Role Permissions</ThemedText>
              </View>
              <ThemedText style={[styles.permHint, { color: mutedColor }]}>Configure what each role can do in each tab.</ThemedText>
            </View>
            <ThemedCard variant="outlined" style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={[styles.settingIcon, { backgroundColor: `${primaryColor}20` }]}>
                    <ShieldCheck size={18} color={primaryColor} />
                  </View>
                  <View>
                    <ThemedText style={styles.settingLabel}>Use Role Hierarchy</ThemedText>
                    <ThemedText style={[styles.settingSubtitle, { color: mutedColor }]}>Higher roles can edit/delete lower roles' items</ThemedText>
                  </View>
                </View>
                <Switch value={hierarchyEnabled} onValueChange={async (val) => { const { error } = await updateHierarchyEnabled(val); if (error) Alert.alert('Error', error.message); }} trackColor={{ false: '#ccc', true: primaryColor }} thumbColor="white" />
              </View>
            </ThemedCard>
            <ThemedCard variant="outlined" style={[styles.settingsCard, { marginTop: spacing.sm }]}>
              <View style={[styles.settingRow, { gap: spacing.sm }]}>
                <TextInput
                  style={[styles.roleNameInput, { borderColor, backgroundColor: inputBg, color: textColor, flex: 1 }]}
                  placeholder="New role name…"
                  placeholderTextColor={mutedColor}
                  value={newRoleName}
                  onChangeText={t => setNewRoleName(t.replace(/\s/g, '-'))}
                  onSubmitEditing={handleAddRole}
                  returnKeyType="done"
                />
                <Pressable onPress={handleAddRole} disabled={addingRole || !newRoleName.trim()} style={[styles.iconBtn, { backgroundColor: primaryColor, opacity: !newRoleName.trim() ? 0.4 : 1, width: 36, height: 36 }]}>
                  <Plus size={16} color="white" strokeWidth={3} />
                </Pressable>
              </View>
            </ThemedCard>
            {effectiveOrder.length > 0 && (
              <ThemedCard variant="outlined" style={[styles.settingsCard, { marginTop: spacing.sm }]}>
                {effectiveOrder.map((role, idx) => (
                  <View key={role} style={[styles.permRoleRow, idx < effectiveOrder.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }]}>
                    {hierarchyEnabled && (
                      <View style={[styles.rankBadge, { backgroundColor: `${primaryColor}20` }]}>
                        <ThemedText style={[styles.rankBadgeText, { color: primaryColor }]}>{idx + 1}</ThemedText>
                      </View>
                    )}
                    <ThemedText style={[styles.permRoleName, { flex: 1 }]}>{role}</ThemedText>
                    <View style={styles.permRoleActions}>
                      {hierarchyEnabled && (
                        <>
                          <Pressable onPress={() => moveRole(idx, -1)} disabled={idx === 0} style={[styles.iconBtn, { backgroundColor: `${primaryColor}15`, opacity: idx === 0 ? 0.3 : 1 }]}>
                            <ChevronUp size={14} color={primaryColor} />
                          </Pressable>
                          <Pressable onPress={() => moveRole(idx, 1)} disabled={idx === effectiveOrder.length - 1} style={[styles.iconBtn, { backgroundColor: `${primaryColor}15`, opacity: idx === effectiveOrder.length - 1 ? 0.3 : 1 }]}>
                            <ChevronDown size={14} color={primaryColor} />
                          </Pressable>
                        </>
                      )}
                      <Pressable onPress={() => openPermEdit(role)} style={[styles.iconBtn, { backgroundColor: `${primaryColor}15` }]}>
                        <Pencil size={14} color={primaryColor} />
                      </Pressable>
                      <Pressable onPress={() => handleRemoveRole(role)} style={[styles.iconBtn, { backgroundColor: '#ff374815' }]}>
                        <X size={14} color="#ff3748" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </ThemedCard>
            )}
          </>
        )}

        {/* ── Household Actions ─────────────────────────────────────────────── */}
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

        {/* ── Account ───────────────────────────────────────────────────────── */}
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

      {/* ════════════════════════════════════════════════════════════════════
          Profile Edit Modal
      ════════════════════════════════════════════════════════════════════ */}
      <Modal visible={profileEditVisible} animationType="slide" transparent onRequestClose={() => setProfileEditVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={[styles.modalSheet, { maxHeight: '92%' }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Edit Profile</ThemedText>
                <Pressable onPress={() => setProfileEditVisible(false)} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>

              <ScrollView style={styles.profileScrollBody} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Avatar preview + colour + icon picker */}
                <View style={styles.avatarEditSection}>
                  {/* Live preview */}
                  <View style={[styles.avatarPreview, { backgroundColor: editAvatarColor || avatarColor }]}>
                    {editAvatarIcon
                      ? <AvatarIcon name={editAvatarIcon} size={36} color="white" />
                      : <ThemedText style={styles.avatarPreviewText}>{initials}</ThemedText>
                    }
                  </View>

                  {/* Colour swatches */}
                  <View style={styles.colorRow}>
                    {AVATAR_COLORS.map(c => (
                      <Pressable
                        key={c}
                        onPress={() => setEditAvatarColor(c)}
                        style={[styles.colorSwatch, { backgroundColor: c }, editAvatarColor === c && styles.colorSwatchSelected]}
                      />
                    ))}
                  </View>

                  {/* Icon grid */}
                  <View style={styles.iconGrid}>
                    {/* "Aa" = use initials (no icon) */}
                    <Pressable
                      onPress={() => setEditAvatarIcon('')}
                      style={[styles.iconOption, { borderColor: editAvatarIcon === '' ? (editAvatarColor || avatarColor) : borderColor, backgroundColor: editAvatarIcon === '' ? (editAvatarColor || avatarColor) : inputBg }]}
                    >
                      <ThemedText style={{ fontSize: 13, fontWeight: '800', color: editAvatarIcon === '' ? 'white' : mutedColor }}>Aa</ThemedText>
                    </Pressable>
                    {AVATAR_ICON_LIST.map(name => {
                      const selected = editAvatarIcon === name;
                      const bg = selected ? (editAvatarColor || avatarColor) : inputBg;
                      const bc = selected ? (editAvatarColor || avatarColor) : borderColor;
                      return (
                        <Pressable key={name} onPress={() => setEditAvatarIcon(name)} style={[styles.iconOption, { backgroundColor: bg, borderColor: bc }]}>
                          <AvatarIcon name={name} size={18} color={selected ? 'white' : mutedColor} />
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <ThemedDivider style={{ marginVertical: spacing.md }} />

                {/* Name */}
                <View style={styles.profileFieldGroup}>
                  <View style={styles.profileFieldLabel}>
                    <User size={14} color={primaryColor} />
                    <ThemedText style={styles.profileFieldLabelText}>Display Name</ThemedText>
                  </View>
                  <View style={[styles.profileInputRow, { borderColor, backgroundColor: inputBg }]}>
                    <TextInput
                      style={[styles.profileInput, { color: textColor }]}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Your name"
                      placeholderTextColor={mutedColor}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                <ThemedDivider style={{ marginVertical: spacing.md }} />

                {/* Password section (collapsible) */}
                <Pressable onPress={() => setShowPasswordSection(v => !v)} style={styles.passwordToggleRow}>
                  <View style={styles.profileFieldLabel}>
                    <Lock size={14} color={primaryColor} />
                    <ThemedText style={styles.profileFieldLabelText}>Change Password</ThemedText>
                  </View>
                  {showPasswordSection ? <ChevronUp size={18} color={mutedColor} /> : <ChevronDown size={18} color={mutedColor} />}
                </Pressable>

                {showPasswordSection && (
                  <View style={styles.passwordFields}>
                    {/* Current password */}
                    <View style={[styles.profileInputRow, { borderColor, backgroundColor: inputBg, marginBottom: spacing.sm }]}>
                      <TextInput
                        style={[styles.profileInput, { color: textColor, flex: 1 }]}
                        value={editOldPassword}
                        onChangeText={setEditOldPassword}
                        placeholder="Current password"
                        placeholderTextColor={mutedColor}
                        secureTextEntry={!showOldPw}
                      />
                      <Pressable onPress={() => setShowOldPw(v => !v)} hitSlop={8}>
                        {showOldPw ? <EyeOff size={16} color={mutedColor} /> : <Eye size={16} color={mutedColor} />}
                      </Pressable>
                    </View>
                    {/* New password */}
                    <View style={[styles.profileInputRow, { borderColor, backgroundColor: inputBg, marginBottom: spacing.sm }]}>
                      <TextInput
                        style={[styles.profileInput, { color: textColor, flex: 1 }]}
                        value={editNewPassword}
                        onChangeText={setEditNewPassword}
                        placeholder="New password"
                        placeholderTextColor={mutedColor}
                        secureTextEntry={!showNewPw}
                      />
                      <Pressable onPress={() => setShowNewPw(v => !v)} hitSlop={8}>
                        {showNewPw ? <EyeOff size={16} color={mutedColor} /> : <Eye size={16} color={mutedColor} />}
                      </Pressable>
                    </View>
                    {/* Confirm new password */}
                    <View style={[styles.profileInputRow, { borderColor, backgroundColor: inputBg }]}>
                      <TextInput
                        style={[styles.profileInput, { color: textColor, flex: 1 }]}
                        value={editConfirmPassword}
                        onChangeText={setEditConfirmPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor={mutedColor}
                        secureTextEntry={!showConfirmPw}
                      />
                      <Pressable onPress={() => setShowConfirmPw(v => !v)} hitSlop={8}>
                        {showConfirmPw ? <EyeOff size={16} color={mutedColor} /> : <Eye size={16} color={mutedColor} />}
                      </Pressable>
                    </View>
                  </View>
                )}

              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable onPress={() => setProfileEditVisible(false)} style={[styles.footerBtn, { borderColor }]}>
                  <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleSaveProfile} disabled={savingProfile}
                  style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: savingProfile ? 0.6 : 1 }]}>
                  <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{savingProfile ? 'Saving…' : 'Save Changes'}</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Role Edit Modal ───────────────────────────────────────────────── */}
      <Modal visible={!!roleEditMember} animationType="slide" transparent onRequestClose={() => setRoleEditMember(null)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Assign Role</ThemedText>
              <Pressable onPress={() => setRoleEditMember(null)} hitSlop={8}><X size={24} color={primaryColor} /></Pressable>
            </View>
            <View style={styles.modalBody}>
              <ThemedText style={[styles.modalHint, { color: mutedColor }]}>
                {roleEditMember?.userId === user?.$id ? 'Your role' : roleEditMember?.userName || roleEditMember?.userEmail?.split('@')[0] || 'This member'}
              </ThemedText>
              {houseRoles.length === 0 ? (
                <ThemedText style={[styles.modalHint, { color: mutedColor }]}>This house has no defined roles.</ThemedText>
              ) : (
                <View style={styles.roleChipsWrap}>
                  <Pressable onPress={() => setSelectedRole('')} style={[styles.roleChip, { borderColor, backgroundColor: inputBg }, selectedRole === '' && { backgroundColor: `${primaryColor}20`, borderColor: primaryColor }]}>
                    <ThemedText style={[styles.roleChipText, selectedRole === '' && { color: primaryColor, fontWeight: '700' }]}>No role</ThemedText>
                  </Pressable>
                  {houseRoles.map((r: string) => (
                    <Pressable key={r} onPress={() => setSelectedRole(r)} style={[styles.roleChip, { borderColor, backgroundColor: inputBg }, selectedRole === r && { backgroundColor: `${primaryColor}20`, borderColor: primaryColor }]}>
                      <ThemedText style={[styles.roleChipText, selectedRole === r && { color: primaryColor, fontWeight: '700' }]}>{r}</ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            <View style={styles.modalFooter}>
              <Pressable onPress={() => setRoleEditMember(null)} style={[styles.footerBtn, { borderColor }]}>
                <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={handleSaveRole} disabled={savingRole} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: savingRole ? 0.6 : 1 }]}>
                <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{savingRole ? 'Saving…' : 'Save'}</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* ── Role Permissions Modal ────────────────────────────────────────── */}
      <Modal visible={!!permEditRole} animationType="slide" transparent onRequestClose={() => setPermEditRole(null)}>
        <View style={styles.modalOverlay}>
          <ThemedView style={[styles.modalSheet, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">{permEditRole} — Permissions</ThemedText>
              <Pressable onPress={() => setPermEditRole(null)} hitSlop={8}><X size={24} color={primaryColor} /></Pressable>
            </View>
            <ScrollView style={{ paddingHorizontal: spacing.lg }}>
              <ThemedText style={[styles.modalHint, { color: mutedColor, paddingTop: spacing.md, paddingBottom: spacing.sm }]}>
                Edit/Delete only apply to items created by members with equal or lower authority.
              </ThemedText>
              {([
                { tab: 'tasks' as const, label: 'Tasks' },
                { tab: 'shop' as const, label: 'Shopping' },
                { tab: 'finances' as const, label: 'Finances' },
                { tab: 'calendar' as const, label: 'Calendar' },
              ] as const).map(({ tab, label }) => (
                <View key={tab} style={[styles.permTabSection, { borderColor, backgroundColor: cardBg }]}>
                  <ThemedText style={[styles.permTabLabel, { color: primaryColor }]}>{label}</ThemedText>
                  {([
                    { key: 'canCreate' as const, label: 'Create new items' },
                    { key: 'canEdit' as const, label: 'Edit items' },
                    { key: 'canDelete' as const, label: 'Delete items' },
                  ]).map(({ key, label: pLabel }) => (
                    <View key={key} style={styles.permToggleRow}>
                      <ThemedText style={styles.permToggleLabel}>{pLabel}</ThemedText>
                      <Switch value={editingPerms[tab][key]} onValueChange={() => togglePerm(tab, key)} trackColor={{ false: '#ccc', true: primaryColor }} thumbColor="white" />
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalFooter}>
              <Pressable onPress={() => setPermEditRole(null)} style={[styles.footerBtn, { borderColor }]}>
                <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
              </Pressable>
              <Pressable onPress={handleSavePerms} disabled={savingPerms} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: savingPerms ? 0.6 : 1 }]}>
                <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{savingPerms ? 'Saving…' : 'Save'}</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>

      {/* ── Invite Modal ──────────────────────────────────────────────────── */}
      <Modal visible={inviteVisible} animationType="slide" transparent onRequestClose={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Invite Member</ThemedText>
                <Pressable onPress={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>
              <View style={[styles.modalTabs, { borderColor }]}>
                <Pressable style={[styles.modalTab, inviteTab === 'email' && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]} onPress={() => setInviteTab('email')}>
                  <Mail size={15} color={inviteTab === 'email' ? primaryColor : mutedColor} />
                  <ThemedText style={[styles.modalTabText, { color: inviteTab === 'email' ? primaryColor : mutedColor }]}>By Email</ThemedText>
                </Pressable>
                <Pressable style={[styles.modalTab, inviteTab === 'code' && { borderBottomColor: primaryColor, borderBottomWidth: 2 }]} onPress={() => setInviteTab('code')}>
                  <Copy size={15} color={inviteTab === 'code' ? primaryColor : mutedColor} />
                  <ThemedText style={[styles.modalTabText, { color: inviteTab === 'code' ? primaryColor : mutedColor }]}>By Code</ThemedText>
                </Pressable>
              </View>
              {inviteTab === 'email' && (
                <>
                  <View style={styles.modalBody}>
                    <ThemedText style={[styles.modalHint, { color: mutedColor }]}>They will receive an email invitation to join your household.</ThemedText>
                    <View style={[styles.emailRow, { borderColor, backgroundColor: inputBg }]}>
                      <Mail size={18} color={mutedColor} />
                      <TextInput style={[styles.emailInput, { color: textColor }]} placeholder="Enter email address" placeholderTextColor={mutedColor} value={inviteEmail} onChangeText={setInviteEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoFocus />
                    </View>
                  </View>
                  <View style={styles.modalFooter}>
                    <Pressable onPress={() => { setInviteVisible(false); setInviteEmail(''); setInviteTab('email'); }} style={[styles.footerBtn, { borderColor }]}>
                      <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                    </Pressable>
                    <Pressable onPress={handleInvite} disabled={inviting} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: inviting ? 0.6 : 1 }]}>
                      <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{inviting ? 'Sending…' : 'Send Invite'}</ThemedText>
                    </Pressable>
                  </View>
                </>
              )}
              {inviteTab === 'code' && (
                <View style={styles.modalBody}>
                  <ThemedText style={[styles.modalHint, { color: mutedColor }]}>Share this code — anyone who enters it in the Join a House screen will be added instantly.</ThemedText>
                  <View style={[styles.codeBox, { borderColor, backgroundColor: inputBg }]}>
                    <ThemedText style={[styles.codeText, { color: primaryColor }]}>{houseCode}</ThemedText>
                    <Pressable onPress={handleCopyCode} style={[styles.copyBtn, { backgroundColor: `${primaryColor}20` }]}>
                      {codeCopied ? <Check size={18} color="#1fc16b" /> : <Copy size={18} color={primaryColor} />}
                    </Pressable>
                  </View>
                  {codeCopied && <ThemedText style={[styles.copiedHint, { color: '#1fc16b' }]}>Copied to clipboard!</ThemedText>}
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
  // Profile card
  profileCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'white', fontWeight: '700', fontSize: 20 },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'white' },
  editProfileBtn: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  profileInfo: { flex: 1 },
  profileName: { fontWeight: '700', fontSize: 16, marginBottom: 2 },
  profileEmail: { fontSize: 13, marginBottom: spacing.xs },
  ownerBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: 8, marginTop: spacing.xs },
  ownerBadgeText: { fontSize: 11, fontWeight: '700' },
  // Settings rows
  settingsCard: { marginHorizontal: spacing.lg, paddingVertical: 0, paddingHorizontal: 0, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '500' },
  settingSubtitle: { fontSize: 12, marginTop: 1 },
  // Members
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
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
  emptyMembers: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyMembersText: { fontSize: 14 },
  divider: { marginHorizontal: spacing.lg, marginTop: spacing.lg },
  // Roles / Perms
  permHint: { fontSize: 12, lineHeight: 17, marginTop: spacing.xs },
  permRoleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  roleNameInput: { borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: 14 },
  rankBadge: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rankBadgeText: { fontSize: 11, fontWeight: '800' },
  permRoleName: { fontWeight: '600', fontSize: 14 },
  permRoleActions: { flexDirection: 'row', gap: spacing.xs },
  permTabSection: { borderWidth: 1, borderRadius: 12, marginBottom: spacing.md, overflow: 'hidden' },
  permTabLabel: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: spacing.md, paddingTop: spacing.sm + 2, paddingBottom: spacing.xs },
  permToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  permToggleLabel: { fontSize: 14, fontWeight: '500' },
  // Profile edit modal
  avatarEditSection: { alignItems: 'center', paddingTop: spacing.md, gap: spacing.md },
  avatarPreviewWrapper: {},
  avatarPreview: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarPreviewText: { color: 'white', fontWeight: '800', fontSize: 28 },
  colorRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', justifyContent: 'center' },
  colorSwatch: { width: 32, height: 32, borderRadius: 16 },
  colorSwatchSelected: { borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center', paddingHorizontal: spacing.xs },
  iconOption: { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  profileScrollBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  profileFieldGroup: { gap: spacing.xs, marginBottom: spacing.sm },
  profileFieldLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  profileFieldLabelText: { fontSize: 13, fontWeight: '600' },
  profileInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, paddingHorizontal: spacing.md, minHeight: 48, gap: spacing.sm },
  profileInput: { flex: 1, fontSize: 15, paddingVertical: spacing.sm },
  passwordToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  passwordFields: { gap: spacing.xs, marginBottom: spacing.sm },
  // Shared modal
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalBody: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.md },
  modalHint: { fontSize: 14, lineHeight: 20 },
  roleChipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.xs },
  roleChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  roleChipText: { fontSize: 14, fontWeight: '500' },
  // Invite
  codeBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: spacing.md, paddingVertical: spacing.md, gap: spacing.md },
  codeText: { flex: 1, fontSize: 18, fontWeight: '800', letterSpacing: 2, fontFamily: 'monospace' },
  copyBtn: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  copiedHint: { fontSize: 13, fontWeight: '600', textAlign: 'center', marginTop: spacing.xs },
  modalTabs: { flexDirection: 'row', borderBottomWidth: 1 },
  modalTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.sm + 2 },
  modalTabText: { fontSize: 13, fontWeight: '700' },
  inviteBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 10, marginLeft: 'auto' },
  inviteBtnText: { fontSize: 12, fontWeight: '700' },
  emailRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 10, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  emailInput: { flex: 1, fontSize: 15 },
  modalFooter: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '700', fontSize: 15 },
});
