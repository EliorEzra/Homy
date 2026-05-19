import { StyleSheet, View, FlatList, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { TaskCard } from '@/components/task-card';
import { TaskForm, TaskFormData } from '@/components/task-form';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { Plus, CheckCircle } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useTasks } from '@/context/tasks_db';
import { Models } from 'react-native-appwrite';

function rowToTask(row: Models.Row) {
  return {
    id: row.$id,
    title: row.task_text ?? '',
    description: row.description ?? '',
    dueDate: row.due_date ?? '',
    status: (row.status ?? 'todo') as "todo" | "in-progress" | "done",
    completed: row.completed ?? false,
  };
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');

  const uiTasks = (tasks ?? []).map(rowToTask);
  const filtered = uiTasks.filter(t => filter === "active" ? !t.completed : filter === "completed" ? t.completed : true);

  const handleAdd = (data: TaskFormData) => {
    addTask({ task_text: data.title, description: data.description, due_date: data.dueDate, status: data.status, completed: false }, []);
    setFormVisible(false);
  };

  const handleEdit = (data: TaskFormData) => {
    if (!editingId) return;
    updateTask(editingId, { task_text: data.title, description: data.description, due_date: data.dueDate, status: data.status });
    setEditingId(null); setFormVisible(false);
  };

  const editingTask = editingId ? uiTasks.find(t => t.id === editingId) : null;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}><ThemedText type="title">Tasks</ThemedText></ThemedView>

      <View style={styles.filterRow}>
        {(["all", "active", "completed"] as const).map(f => (
          <Pressable key={f} onPress={() => setFilter(f)}
            style={[styles.filterChip, { borderColor }, filter === f && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
            <ThemedText style={[styles.filterText, filter === f && styles.filterTextActive]}>
              {f === "all" ? "All" : f === "active" ? "Active" : "Completed"}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <ThemedEmptyState
          title={filter === "all" ? "No Tasks Yet" : filter === "active" ? "All Tasks Complete" : "No Completed Tasks"}
          description={filter === "all" ? "Create your first task to get started" : "Keep up the great work!"}
          icon={<CheckCircle size={64} color="#ff5c02" opacity={0.5} />}
          action={filter === "all" ? <ThemedButton title="+ Create Task" onPress={() => { setEditingId(null); setFormVisible(true); }} size="md" /> : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard {...item}
              onEdit={() => { setEditingId(item.id); setFormVisible(true); }}
              onDelete={() => deleteTask(item.id)}
              onToggleComplete={() => updateTask(item.id, { completed: !item.completed })}
              style={styles.taskCard}
            />
          )}
          contentContainerStyle={styles.list}
          scrollEnabled={false}
        />
      )}

      <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => { setEditingId(null); setFormVisible(true); }}>
        <Plus size={28} color="white" strokeWidth={3} />
      </Pressable>

      <TaskForm
        key={editingId ?? 'new'}
        visible={formVisible}
        isEditing={!!editingId}
        initialData={editingTask ? { title: editingTask.title, description: editingTask.description, dueDate: editingTask.dueDate, status: editingTask.status } : undefined}
        onSubmit={editingId ? handleEdit : handleAdd}
        onClose={() => { setFormVisible(false); setEditingId(null); }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: 'white' },
  list: { paddingHorizontal: spacing.lg },
  taskCard: { marginHorizontal: 0 },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
});
