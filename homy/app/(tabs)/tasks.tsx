import { StyleSheet, View, FlatList, Pressable, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { TaskCard } from '@/components/task-card';
import { TaskForm, TaskFormData } from '@/components/task-form';
import { spacing, typography } from '@/theme/theme';
import { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react-native';
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export type Task = {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
  completed: boolean;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Welcome to Homy',
      description: 'Check out the task management system',
      dueDate: '',
      status: 'todo',
      completed: false,
    },
  ]);

  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true;
  });

  const handleAddTask = (data: TaskFormData) => {
    const newTask: Task = {
      id: generateId(),
      ...data,
      completed: false,
    };
    setTasks([newTask, ...tasks]);
    setFormVisible(false);
  };

  const handleEditTask = (data: TaskFormData) => {
    if (!editingId) return;
    setTasks(
      tasks.map((task) =>
        task.id === editingId
          ? { ...task, ...data }
          : task
      )
    );
    setEditingId(null);
    setFormVisible(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const handleToggleComplete = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const openEditForm = (task: Task) => {
    setEditingId(task.id);
    setFormVisible(true);
  };

  const closeForm = () => {
    setFormVisible(false);
    setEditingId(null);
  };

  const editingTask = editingId ? tasks.find((t) => t.id === editingId) : null;

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <ThemedView style={styles.headerContainer}>
        <ThemedText type="title">Tasks</ThemedText>
      </ThemedView>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(["all", "active", "completed"] as const).map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            style={[
              styles.filterButton,
              filter === f && styles.filterButtonActive,
            ]}
          >
            <ThemedText
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f === "all"
                ? "All"
                : f === "active"
                ? "Active"
                : "Completed"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Task List or Empty State */}
      {filteredTasks.length === 0 ? (
        <ThemedEmptyState
          title={
            filter === "all"
              ? "No Tasks Yet"
              : filter === "active"
              ? "All Tasks Complete"
              : "No Completed Tasks"
          }
          description={
            filter === "all"
              ? "Create your first task to get started"
              : "Keep up the great work!"
          }
          icon={<CheckCircle size={64} color="#ff5c02" opacity={0.5} />}
          action={
            filter === "all" ? (
              <ThemedButton
                title="+ Create Task"
                onPress={() => {
                  setEditingId(null);
                  setFormVisible(true);
                }}
                size="md"
              />
            ) : undefined
          }
        />
      ) : (
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskCard
              key={item.id}
              id={item.id}
              title={item.title}
              description={item.description}
              dueDate={item.dueDate}
              status={item.status}
              completed={item.completed}
              onEdit={() => openEditForm(item)}
              onDelete={() => handleDeleteTask(item.id)}
              onToggleComplete={() => handleToggleComplete(item.id)}
              style={styles.taskCard}
            />
          )}
          contentContainerStyle={styles.listContainer}
          scrollEnabled={false}
        />
      )}

      {/* Floating Action Button */}
      <Pressable
        style={styles.fab}
        onPress={() => {
          setEditingId(null);
          setFormVisible(true);
        }}
      >
        <Plus size={28} color="white" strokeWidth={3} />
      </Pressable>

      {/* Task Form Modal */}
      <TaskForm
        key={editingId ?? 'new'}
        visible={formVisible}
        isEditing={!!editingId}
        initialData={
          editingTask
            ? {
                title: editingTask.title,
                description: editingTask.description,
                dueDate: editingTask.dueDate,
                status: editingTask.status,
              }
            : undefined
        }
        onSubmit={editingId ? handleEditTask : handleAddTask}
        onClose={closeForm}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
  },
  filterButtonActive: {
    backgroundColor: '#ff5c02',
    borderColor: '#ff5c02',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    paddingHorizontal: spacing.lg,
  },
  taskCard: {
    marginHorizontal: 0,
  },
  fab: {
    position: 'absolute',
    bottom: spacing.lg,
    right: spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ff5c02',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
