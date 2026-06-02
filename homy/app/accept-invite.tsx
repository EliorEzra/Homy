import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/themed-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useHouse } from '@/context/house';
import { useAuth } from '@/context/auth';
import { CheckCircle, XCircle, Home, AlertTriangle } from 'lucide-react-native';
import { spacing } from '@/theme/theme';

export default function AcceptInviteScreen() {
  const { teamId, membershipId, userId, secret } = useLocalSearchParams<{
    teamId: string;
    membershipId: string;
    userId: string;
    secret: string;
  }>();

  const { acceptHouseInvite, leaveHouse, deleteHouse, house } = useHouse();
  const { user } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const [status, setStatus] = useState<
    'loading' | 'success' | 'error' | 'needs-auth' | 'has-house'
  >('loading');
  const [errorMsg, setErrorMsg] = useState('');
  const [leavingHouse, setLeavingHouse] = useState(false);
  // Prevent doAccept from being called twice (once directly, once from useEffect)
  const acceptAttempted = useRef(false);

  const isOwner = house?.roles?.includes('owner') ?? false;

  useEffect(() => {
    if (!teamId || !membershipId || !secret) {
      setStatus('error');
      setErrorMsg('Invalid invite link — missing parameters.');
      return;
    }
    if (!user) {
      setStatus('needs-auth');
      return;
    }
    // User is already in a house — ask them first before doing anything
    if (house) {
      setStatus('has-house');
      return;
    }

    doAccept();
  }, [user, house]);

  const doAccept = async () => {
    if (acceptAttempted.current) return;
    acceptAttempted.current = true;
    setStatus('loading');
    const { error } = await acceptHouseInvite(teamId!, membershipId!, secret!);
    if (error) {
      setStatus('error');
      setErrorMsg(error.message ?? 'Could not accept the invitation.');
    } else {
      setStatus('success');
    }
  };

  const handleLeaveAndJoin = async () => {
    const action = isOwner ? 'close your current house' : 'leave your current house';
    Alert.alert(
      'Are you sure?',
      `This will ${action} and cannot be undone. You will then join the new household.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isOwner ? 'Close & Join' : 'Leave & Join',
          style: 'destructive',
          onPress: async () => {
            setLeavingHouse(true);
            const { error } = isOwner ? await deleteHouse() : await leaveHouse();
            setLeavingHouse(false);
            if (error) {
              Alert.alert('Error', error.message);
              return;
            }
            // house is now null in context — the useEffect will fire and call doAccept()
          },
        },
      ]
    );
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ThemedView style={styles.container}>

        {status === 'loading' && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={primaryColor} />
            <ThemedText style={[styles.msg, { color: mutedColor }]}>
              {leavingHouse ? 'Leaving current house…' : 'Accepting invite…'}
            </ThemedText>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.center}>
            <CheckCircle size={64} color="#1fc16b" />
            <ThemedText style={styles.heading}>You're in!</ThemedText>
            <ThemedText style={[styles.msg, { color: mutedColor }]}>
              You've successfully joined the household.
            </ThemedText>
            <ThemedButton
              title="Go to Home"
              onPress={() => router.replace('/(tabs)')}
              style={styles.btn}
            />
          </View>
        )}

        {status === 'error' && (
          <View style={styles.center}>
            <XCircle size={64} color="#ff3748" />
            <ThemedText style={styles.heading}>Invite Failed</ThemedText>
            <ThemedText style={[styles.msg, { color: mutedColor }]}>{errorMsg}</ThemedText>
            <ThemedButton
              title="Go to Home"
              onPress={() => router.replace('/(tabs)')}
              style={styles.btn}
            />
          </View>
        )}

        {status === 'needs-auth' && (
          <View style={styles.center}>
            <Home size={64} color={primaryColor} />
            <ThemedText style={styles.heading}>Almost there!</ThemedText>
            <ThemedText style={[styles.msg, { color: mutedColor }]}>
              Sign in or create an account to accept this household invitation.
            </ThemedText>
            <ThemedButton
              title="Sign In"
              onPress={() => router.push('/(auth)/sign-in')}
              style={styles.btn}
            />
            <ThemedButton
              title="Create Account"
              onPress={() => router.push('/(auth)/sign-up')}
              style={[styles.btn, styles.btnSecondary]}
            />
          </View>
        )}

        {status === 'has-house' && (
          <View style={styles.center}>
            <AlertTriangle size={64} color="#e0a500" />
            <ThemedText style={styles.heading}>You're already in a house</ThemedText>
            <ThemedText style={[styles.msg, { color: mutedColor }]}>
              {isOwner
                ? `You own a household. To join this new one you'll need to close your current house first — this will remove all members.`
                : `You're already a member of a household. To join this new one you'll need to leave your current house first.`}
            </ThemedText>
            <ThemedButton
              title={isOwner ? 'Close My House & Join' : 'Leave My House & Join'}
              onPress={handleLeaveAndJoin}
              style={[styles.btn, styles.btnDestructive]}
            />
            <ThemedButton
              title="Decline Invite"
              onPress={() => router.replace('/(tabs)')}
              style={[styles.btn, styles.btnSecondary]}
            />
          </View>
        )}

      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl, gap: spacing.md },
  heading: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
  msg: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
  btn: { width: '100%', marginTop: spacing.sm },
  btnSecondary: { opacity: 0.6 },
  btnDestructive: { backgroundColor: '#ff3748' },
});
