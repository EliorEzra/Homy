import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';
import { EventCard } from '@/components/ui/event-card';
import { TaskItem } from '@/components/ui/task-item';
import { Badge } from '@/components/ui/badge';
import { HeaderWithAction } from '@/components/ui/header-with-action';
import { Menu, Home, Bell, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { useAuth } from '../../context/auth';

export default function HomeScreen() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([
    {
      id: '1',
      title: 'Renew home insurance policy',
      dueTime: 'Due by 5:00 PM',
      completed: false,
    },
  ]);

  const events = [
    {
      id: '1',
      icon: '📅',
      time: '10:00 AM',
      title: 'Morning Garden Yoga',
      location: 'Community Wellness Center',
      highlighted: true,
    },
    {
      id: '2',
      icon: '👥',
      time: '12:30 PM',
      title: 'Lunch w...',
      location: 'The Green...',
      highlighted: false,
    },
  ];

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <ThemedView style={styles.container}>
      {/* Top Navigation Bar */}
      <ThemedView style={[styles.header, shadows.sm]}>
        <TouchableOpacity style={styles.headerIcon}>
          <Menu size={24} color={lightModePalette.onSurface} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Home size={24} color={lightModePalette.primary.DEFAULT} />
          <ThemedText style={styles.headerLogo}>HOMY</ThemedText>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Bell size={24} color={lightModePalette.onSurface} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.plusButton,
              { backgroundColor: lightModePalette.primary.DEFAULT },
            ]}
          >
            <Plus size={24} color={lightModePalette.neutral[100]} />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting Section */}
        <ThemedView style={styles.greetingSection}>
          <ThemedText style={styles.greeting}>Good Morning, Sarah!</ThemedText>
          <View style={styles.subtitleContainer}>
            <ThemedText style={styles.subtitle}>Today is a gentle Tuesday. You have </ThemedText>
            <ThemedText style={[styles.subtitle, styles.highlight]}>3 appointments</ThemedText>
            <ThemedText style={styles.subtitle}> and </ThemedText>
            <ThemedText style={[styles.subtitle, styles.highlight]}>5 tasks</ThemedText>
            <ThemedText style={styles.subtitle}> awaiting your attention.</ThemedText>
          </View>
        </ThemedView>

        {/* Upcoming Events Section */}
        <ThemedView>
          <HeaderWithAction
            title="Upcoming Events"
            actionText="VIEW ALL"
            onActionPress={() => {}}
          />

          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            scrollEventThrottle={16}
            renderItem={({ item }) => (
              <EventCard
                icon={<ThemedText style={styles.eventIcon}>{item.icon}</ThemedText>}
                time={item.time}
                title={item.title}
                location={item.location}
                highlighted={item.highlighted}
              />
            )}
            style={styles.eventsList}
          />
        </ThemedView>

        {/* Tasks Due Today Section */}
        <ThemedView>
          <View style={styles.tasksHeader}>
            <ThemedText style={styles.tasksTitle}>Tasks Due Today</ThemedText>
            <Badge label="5 REMAINING" variant="secondary" />
          </View>

          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              title={task.title}
              dueTime={task.dueTime}
              completed={task.completed}
              onToggle={() => toggleTaskComplete(task.id)}
            />
          ))}
        </ThemedView>

        <View style={styles.spacer} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: lightModePalette.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: lightModePalette.outline,
  },
  headerIcon: {
    padding: spacing.sm,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerLogo: {
    ...typography.label.lg,
    color: lightModePalette.onSurface,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bellIcon: {
    position: 'relative',
    padding: spacing.sm,
  },
  badge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: lightModePalette.error.DEFAULT,
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  greetingSection: {
    marginBottom: spacing.xl,
  },
  greeting: {
    ...typography.heading[1],
    color: lightModePalette.onSurface,
    marginBottom: spacing.md,
  },
  subtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subtitle: {
    ...typography.body.md,
    color: lightModePalette.onSurfaceVariant,
  },
  highlight: {
    color: lightModePalette.primary.DEFAULT,
    fontWeight: '600',
  },
  eventsList: {
    marginBottom: spacing.xl,
  },
  eventIcon: {
    fontSize: 24,
  },
  tasksHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  tasksTitle: {
    ...typography.heading[3],
    color: lightModePalette.onSurface,
  },
  spacer: {
    height: spacing.xl,
  },
});