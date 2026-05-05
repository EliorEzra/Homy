import { StyleSheet, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';
import { EventCard } from '@/components/ui/event-card';
import { TaskItem } from '@/components/ui/task-item';
import { Badge } from '@/components/ui/badge';
import { HeaderWithAction } from '@/components/ui/header-with-action';
import { IconButton } from '@/components/ui/icon-button';
import { Heading, Body, Caption } from '@/components/ui/typography';
import { Menu, Home, Bell, Plus } from 'lucide-react-native';
import { useState } from 'react';

export default function HomeScreen() {
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
        <IconButton
          icon={Menu}
          backgroundColor="transparent"
          iconColor={lightModePalette.onSurface}
          size="md"
        />

        <View style={styles.headerCenter}>
          <Home size={24} color={lightModePalette.primary.DEFAULT} />
          <Heading level={3} color={lightModePalette.onSurface}>HOMY</Heading>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.bellIcon}>
            <Bell size={24} color={lightModePalette.onSurface} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <IconButton
            icon={Plus}
            backgroundColor={lightModePalette.primary.DEFAULT}
            iconColor={lightModePalette.neutral[100]}
            size="md"
          />
        </View>
      </ThemedView>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Greeting Section */}
        <ThemedView style={styles.greetingSection}>
          <Heading level={1} color={lightModePalette.onSurface}>
            Good Morning, Sarah!
          </Heading>
          <View style={styles.subtitleContainer}>
            <Body size="md" color={lightModePalette.onSurfaceVariant}>
              Today is a gentle Tuesday. You have{' '}
            </Body>
            <Body size="md" color={lightModePalette.primary.DEFAULT} style={{ fontWeight: '600' }}>
              3 appointments
            </Body>
            <Body size="md" color={lightModePalette.onSurfaceVariant}>
              {' '}and{' '}
            </Body>
            <Body size="md" color={lightModePalette.primary.DEFAULT} style={{ fontWeight: '600' }}>
              5 tasks
            </Body>
            <Body size="md" color={lightModePalette.onSurfaceVariant}>
              {' '}awaiting your attention.
            </Body>
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
                icon={<Body style={styles.eventIcon}>{item.icon}</Body>}
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
            <Heading level={3} color={lightModePalette.onSurface}>
              Tasks Due Today
            </Heading>
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  subtitleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
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
  spacer: {
    height: spacing.xl,
  },
});