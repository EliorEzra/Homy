import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';
import { TaskItem } from '@/components/ui/task-item';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { Badge } from '@/components/ui/badge';
import { Menu, Home, Bell, Plus, Filter } from 'lucide-react-native';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  dueTime: string;
  assignedTo?: string;
  tags?: string[];
  completed: boolean;
  priority?: 'urgent' | 'normal' | 'low';
}

export default function TasksScreen() {
  const [activeTab, setActiveTab] = useState(0);
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Replace HVAC filters',
      dueTime: 'Due by 5:00 PM',
      assignedTo: 'David',
      tags: ['Maintenance'],
      completed: false,
      priority: 'urgent',
    },
    {
      id: '2',
      title: 'Grocery Restock (Events)',
      dueTime: 'Due by 5:00 PM',
      assignedTo: 'Sarah',
      tags: ['Kitchen'],
      completed: false,
      priority: 'urgent',
    },
  ]);

  const filterTabs = ['All', 'Mine', 'Assigned', 'Completed'];

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && !t.completed);
  const normalTasks = tasks.filter(t => t.priority !== 'urgent' && !t.completed);

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
          <TouchableOpacity style={styles.filterIcon}>
            <Filter size={24} color={lightModePalette.onSurface} />
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
        {/* Page Title */}
        <ThemedText style={styles.pageTitle}>Tasks</ThemedText>

        {/* Filter Tabs */}
        <FilterTabs
          tabs={filterTabs}
          activeTab={activeTab}
          onTabPress={setActiveTab}
        />

        {/* Urgent Tasks Section */}
        {urgentTasks.length > 0 && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Urgent</ThemedText>
              <Badge
                label={`${urgentTasks.length} ITEMS`}
                variant="danger"
              />
            </View>

            {urgentTasks.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                dueTime={task.dueTime}
                completed={task.completed}
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}
          </ThemedView>
        )}

        {/* Normal Tasks Section */}
        {normalTasks.length > 0 && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Normal</ThemedText>
              <Badge
                label={`${normalTasks.length} ITEMS`}
                variant="primary"
              />
            </View>

            {normalTasks.map((task) => (
              <TaskItem
                key={task.id}
                title={task.title}
                dueTime={task.dueTime}
                completed={task.completed}
                onToggle={() => toggleTaskComplete(task.id)}
              />
            ))}
          </ThemedView>
        )}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyStateText}>
              No tasks yet. Create one to get started!
            </ThemedText>
          </View>
        )}

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
  filterIcon: {
    padding: spacing.sm,
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
  pageTitle: {
    ...typography.heading[2],
    color: lightModePalette.onSurface,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.heading[3],
    color: lightModePalette.onSurface,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyStateText: {
    ...typography.body.md,
    color: lightModePalette.onSurfaceVariant,
  },
  spacer: {
    height: spacing.xl,
  },
});