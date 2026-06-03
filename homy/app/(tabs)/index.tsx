import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { FadeScreen } from '@/components/fade-screen';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useAuth } from '../../context/auth';
import { useHouse } from '@/context/house';
import { useTasks } from '@/context/tasks_db';
import { useEvents } from '@/context/events_db';
import { spacing } from '@/theme/theme';
import { useRouter } from 'expo-router';
import { Calendar, CheckCircle, ShoppingCart, DollarSign, ArrowRight } from 'lucide-react-native';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ADJECTIVES = ['gentle', 'bright', 'lovely', 'fine', 'great', 'wonderful', 'beautiful'];

function QuickCard({ label, icon, color, onPress }: { label: string; icon: React.ReactNode; color: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.quickCard, { backgroundColor: color }]}>
      <View style={styles.quickCardIcon}>{icon}</View>
      <ThemedText style={styles.quickCardLabel}>{label}</ThemedText>
      <ArrowRight size={14} color="rgba(255,255,255,0.7)" />
    </Pressable>
  );
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { house } = useHouse();
  const { tasks } = useTasks();
  const { events } = useEvents();
  const isOwner = house?.roles?.includes('owner') ?? false;
  const router = useRouter();

  const todayStr = (() => {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  })();

  const tasksDueToday = (tasks ?? []).filter(t => {
    if (!t.due_date || t.completed) return false;
    const d = new Date(t.due_date as string);
    if (isNaN(d.getTime())) return false;
    const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (ds !== todayStr) return false;
    // Apply the same visibility rule as the Tasks tab
    const assignedTo = t.assigned_to ? (t.assigned_to as string).split(',').filter(Boolean) : [];
    return isOwner || assignedTo.length === 0 || assignedTo.includes(user?.$id ?? '');
  });

  const eventsToday = (events ?? []).filter(e => {
    if (e.date !== todayStr) return false;
    if (isOwner) return true;
    const a = e.assigned_to ? (e.assigned_to as string).split(',').filter(Boolean) : [];
    return a.length === 0 || a.includes(user?.$id ?? '');
  });
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const dayName = DAY_NAMES[now.getDay()];
  const adjective = ADJECTIVES[now.getDay()];
  const userName = user?.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : user?.email?.split('@')[0] || 'there';

  return (
    <FadeScreen>
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Greeting */}
        <View style={styles.greetingSection}>
          <ThemedText style={styles.greetingText}>{greeting}, {userName}!</ThemedText>
          <ThemedText style={styles.greetingSubtitle}>Today is a {adjective} {dayName}.</ThemedText>
        </View>

        {/* Quick Nav Cards */}
        <View style={styles.quickGrid}>
          <QuickCard label="Tasks" icon={<CheckCircle size={22} color="white" />} color="#106d8f" onPress={() => router.push('/(tabs)/tasks')} />
          <QuickCard label="Shop" icon={<ShoppingCart size={22} color="white" />} color="#1a8fad" onPress={() => router.push('/(tabs)/shop')} />
          <QuickCard label="Finances" icon={<DollarSign size={22} color="white" />} color="#1a5276" onPress={() => router.push('/(tabs)/finances')} />
          <QuickCard label="Calendar" icon={<Calendar size={22} color="white" />} color="#0d7ea8" onPress={() => router.push('/(tabs)/calendar')} />
        </View>

        {/* Today's Events */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Today's Events</ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/calendar')}>
            <ThemedText style={[styles.viewAll, { color: mutedColor }]}>VIEW ALL</ThemedText>
          </Pressable>
        </View>
        {eventsToday.length === 0 ? (
          <ThemedCard variant="outlined" style={styles.emptyCard}>
            <View style={[styles.emptyIconBox, { backgroundColor: `${primaryColor}20` }]}>
              <Calendar size={24} color={primaryColor} />
            </View>
            <ThemedText style={styles.emptyText}>No events today</ThemedText>
            <ThemedText style={[styles.emptySub, { color: mutedColor }]}>Go to Calendar to add one</ThemedText>
          </ThemedCard>
        ) : eventsToday.map(event => (
          <ThemedCard key={event.$id} variant="outlined" style={styles.eventCard}>
            <View style={[styles.eventAccent, { backgroundColor: primaryColor }]} />
            <View style={styles.eventInfo}>
              <ThemedText style={[styles.eventTime, { color: mutedColor }]}>{(() => { const [h,m] = (event.time as string).split(':').map(Number); const ap = h >= 12 ? 'PM' : 'AM'; return `${h%12||12}:${String(m).padStart(2,'0')} ${ap}`; })()}</ThemedText>
              <ThemedText style={styles.eventTitle} numberOfLines={1}>{event.title as string}</ThemedText>
            </View>
          </ThemedCard>
        ))}

        {/* Tasks Due Today */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Tasks Due Today</ThemedText>
          <Pressable onPress={() => router.push('/(tabs)/tasks')}>
            <ThemedText style={[styles.viewAll, { color: mutedColor }]}>VIEW ALL</ThemedText>
          </Pressable>
        </View>
        {tasksDueToday.length === 0 ? (
          <ThemedCard variant="outlined" style={styles.emptyTaskCard}>
            <CheckCircle size={18} color={mutedColor} />
            <ThemedText style={[styles.emptyTaskText, { color: mutedColor }]}>No tasks due today</ThemedText>
          </ThemedCard>
        ) : tasksDueToday.map(task => (
          <ThemedCard key={task.$id} variant="outlined" style={styles.taskDueCard}>
            <CheckCircle size={18} color={primaryColor} />
            <ThemedText style={styles.taskDueTitle} numberOfLines={1}>{task.task_text as string}</ThemedText>
          </ThemedCard>
        ))}
      </ScrollView>
    </ThemedView>
    </FadeScreen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: spacing.xl * 2 },
  greetingSection: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.md },
  greetingText: { fontSize: 28, fontWeight: '800', marginBottom: spacing.sm, lineHeight: 34 },
  greetingSubtitle: { fontSize: 14, lineHeight: 20, opacity: 0.65 },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg, gap: spacing.md, marginBottom: spacing.xl, marginTop: spacing.md },
  quickCard: { width: '47%', borderRadius: 14, padding: spacing.md, minHeight: 90, gap: spacing.xs },
  quickCardIcon: { marginBottom: spacing.xs },
  quickCardLabel: { color: 'white', fontWeight: '700', fontSize: 15 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  viewAll: { fontSize: 12, fontWeight: '600' },
  emptyCard: { marginHorizontal: spacing.lg, alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm, marginBottom: spacing.lg },
  emptyIconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontWeight: '600', fontSize: 14 },
  emptySub: { fontSize: 12 },
  emptyTaskCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.lg },
  emptyTaskText: { fontSize: 14 },
  eventCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: 0, marginBottom: spacing.sm, overflow: 'hidden' },
  eventAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginLeft: spacing.sm },
  eventInfo: { flex: 1, paddingRight: spacing.sm },
  eventTime: { fontSize: 11, fontWeight: '600', marginBottom: 1 },
  eventTitle: { fontWeight: '600', fontSize: 14 },
  eventDesc: { fontSize: 12 },
  taskDueCard: { marginHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.sm },
  taskDueTitle: { fontSize: 14, fontWeight: '500', flex: 1 },
});
