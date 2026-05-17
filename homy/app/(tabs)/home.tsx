import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '../../context/auth';
import { spacing } from '@/theme/theme';
import { useRouter } from 'expo-router';
import {
  Calendar,
  CheckCircle,
  ShoppingCart,
  DollarSign,
  ArrowRight,
  Users,
} from 'lucide-react-native';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ADJECTIVES = ['gentle', 'bright', 'lovely', 'fine', 'great', 'wonderful', 'beautiful'];

function SectionHeader({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) {
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      {actionLabel && (
        <Pressable onPress={onAction} style={styles.viewAll}>
          <ThemedText style={[styles.viewAllText, { color: mutedColor }]}>{actionLabel}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

type QuickCardProps = {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
};

function QuickCard({ label, icon, color, onPress }: QuickCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.quickCard, { backgroundColor: color }]}>
      <View style={styles.quickCardIcon}>{icon}</View>
      <ThemedText style={styles.quickCardLabel}>{label}</ThemedText>
      <ArrowRight size={14} color="rgba(255,255,255,0.7)" style={{ marginTop: 'auto' }} />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const borderColor = useThemeColor({}, 'inputBorder');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const dayName = DAY_NAMES[now.getDay()];
  const adjective = ADJECTIVES[now.getDay()];
  const userName = user?.name
    ? user.name.charAt(0).toUpperCase() + user.name.slice(1)
    : user?.email?.split('@')[0] || 'there';

  return (
    <ThemedView style={styles.container}>
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

      {/* Greeting */}
      <View style={styles.greetingSection}>
        <ThemedText style={styles.greetingText}>
          {greeting}, {userName}!
        </ThemedText>
        <ThemedText style={styles.greetingSubtitle}>
          Today is a {adjective} {dayName}. Tap a section below to get started.
        </ThemedText>
      </View>

      {/* Quick Nav Cards */}
      <View style={styles.quickGrid}>
        <QuickCard
          label="Tasks"
          icon={<CheckCircle size={22} color="white" />}
          color="#ff5c02"
          onPress={() => router.push('/(tabs)/tasks')}
        />
        <QuickCard
          label="Shop"
          icon={<ShoppingCart size={22} color="white" />}
          color="#4d00ff"
          onPress={() => router.push('/(tabs)/shop')}
        />
        <QuickCard
          label="Finances"
          icon={<DollarSign size={22} color="white" />}
          color="#1fc16b"
          onPress={() => router.push('/(tabs)/finances')}
        />
        <QuickCard
          label="Calendar"
          icon={<Calendar size={22} color="white" />}
          color="#e0a500"
          onPress={() => router.push('/(tabs)/calendar')}
        />
      </View>

      {/* Upcoming Events */}
      <SectionHeader
        title="Upcoming Events"
        actionLabel="VIEW ALL"
        onAction={() => router.push('/(tabs)/calendar')}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.eventsScroll}
      >
        <ThemedCard variant="outlined" style={styles.emptyEventCard}>
          <View style={[styles.eventIconBox, { backgroundColor: `${primaryColor}20` }]}>
            <Calendar size={24} color={primaryColor} />
          </View>
          <ThemedText style={styles.emptyCardText}>No upcoming events</ThemedText>
          <ThemedText style={[styles.emptyCardSub, { color: mutedColor }]}>
            Go to Calendar to add one
          </ThemedText>
        </ThemedCard>
      </ScrollView>

      {/* Tasks Due Today */}
      <SectionHeader
        title="Tasks Due Today"
        actionLabel="VIEW ALL"
        onAction={() => router.push('/(tabs)/tasks')}
      />
      <ThemedCard variant="outlined" style={styles.emptyTaskCard}>
        <View style={styles.emptyTaskRow}>
          <CheckCircle size={20} color={mutedColor} />
          <ThemedText style={[styles.emptyTaskText, { color: mutedColor }]}>
            No tasks due today — go to Tasks to add some
          </ThemedText>
        </View>
      </ThemedCard>

    </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    paddingBottom: spacing.xl * 2,
  },
  greetingSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: spacing.sm,
    lineHeight: 34,
  },
  greetingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.65,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  quickCard: {
    width: '47%',
    borderRadius: 14,
    padding: spacing.md,
    minHeight: 90,
    gap: spacing.xs,
  },
  quickCardIcon: {
    marginBottom: spacing.xs,
  },
  quickCardLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    padding: 4,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  eventsScroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  emptyEventCard: {
    width: 200,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  eventIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyCardText: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  emptyCardSub: {
    fontSize: 12,
    textAlign: 'center',
  },
  emptyTaskCard: {
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  emptyTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  emptyTaskText: {
    fontSize: 14,
    flex: 1,
  },
});
