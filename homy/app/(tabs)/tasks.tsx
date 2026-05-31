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
import { useHouse } from '@/context/house';
import { useAuth } from '@/context/auth';
import { usePermissions } from '@/hooks/use-permissions';
import { Models } from 'react-native-appwrite';

function rowToTask(row: Models.Row) {
  return {
    id: row.$id,
    title: row.task_text ?? '',
    description: row.description ?? '',
    dueDate: row.due_date ?? '',
    status: (row.status ?? 'todo') as "todo" | "in-progress" | "done",
    completed: row.completed ?? false,
    userId: (row.userId as string) ?? '',
    // stored as comma-separated userIds, expose as string[]
    assignedTo: row.assigned_to
      ? (row.assigned_to as string).split(',').filter(Boolean)
      : [] as string[],
  };
}

export default function TasksScreen() {
  const { tasks, addTask, updateTask, deleteTask } = useTasks();
  const { members, house } = useHouse();
  const { user } = useAuth();
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [whoFilter, setWhoFilter] = useState<'all' | 'mine'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');

  const { canCreate, canEdit, canDelete } = usePermissions();

  const uiTasks = (tasks ?? []).map(rowToTask);

  const filtered = uiTasks
    .filter(t => {
      if (whoFilter === 'mine') return t.assignedTo.length === 0 || t.assignedTo.includes(user?.$id ?? '');
      return true; // "all" — show everything
    })
    .filter(t => statusFilter === 'active' ? !t.completed : statusFilter === 'completed' ? t.completed : true);

  // Build display label for a single userId
  const getMemberLabel = (userId: string) => {
    if (userId === user?.$id) return 'Me';
    const m = members.find(m => m.userId === userId);
    return m ? (m.userName || m.userEmail?.split('@')[0] || userId.slice(0, 6)) : userId.slice(0, 6);
  };

  // Build a comma-joined display string for an array of userIds
  const getAssigneesLabel = (userIds: string[]) =>
    userIds.length === 0 ? undefined : userIds.map(getMemberLabel).join(', ');

  const handleAdd = (data: TaskFormData) => {
    const assigned = data.assignedTo.length > 0 ? data.assignedTo.join(',') : undefined;
    addTask({ task_text: data.title, description: data.description, due_date: data.dueDate, status: data.status, completed: false, assigned_to: assigned }, []);
    setFormVisible(false);
  };

  const handleEdit = (data: TaskFormData) => {
    if (!editingId) return;
    const assigned = data.assignedTo.length > 0 ? data.assignedTo.join(',') : undefined;
    updateTask(editingId, { task_text: data.title, description: data.description, due_date: data.dueDate, status: data.status, assigned_to: assigned });
    setEditingId(null); setFormVisible(false);
  };

  const editingTask = editingId ? uiTasks.find(t => t.id === editingId) : null;

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}><ThemedText type="title">Tasks</ThemedText></ThemedView>

      <View style={styles.filterRow}>
        {(['all', 'mine'] as const).map(f => (
          <Pressable key={f} onPress={() => setWhoFilter(f)}
            style={[styles.filterChip, { borderColor }, whoFilter === f && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
            <ThemedText style={[styles.filterText, whoFilter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : 'Mine'}
            </ThemedText>
          </Pressable>
        ))}
        <View style={styles.filterDivider} />
        {(['all', 'active', 'completed'] as const).map(f => (
          <Pressable key={f} onPress={() => setStatusFilter(f)}
            style={[styles.filterChip, { borderColor }, statusFilter === f && { backgroundColor: primaryColor, borderColor: primaryColor }]}>
            <ThemedText style={[styles.filterText, statusFilter === f && styles.filterTextActive]}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <ThemedEmptyState
          title={statusFilter === 'completed' ? "No Completed Tasks" : statusFilter === 'active' ? "All Tasks Complete" : whoFilter === 'mine' ? "No Tasks For You" : "No Tasks Yet"}
          description={statusFilter === 'all' && whoFilter === 'all' ? "Create your first task to get started" : "Keep up the great work!"}
          icon={<CheckCircle size={64} color="#ff5c02" opacity={0.5} />}
          action={statusFilter === 'all' && whoFilter === 'all' && canCreate('tasks') ? <ThemedButton title="+ Create Task" onPress={() => { setEditingId(null); setFormVisible(true); }} size="md" /> : undefined}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard {...item}
              assignedTo={getAssigneesLabel(item.assignedTo)}
              onEdit={canEdit('tasks', item.userId) ? () => { setEditingId(item.id); setFormVisible(true); } : undefined}
              onDelete={canDelete('tasks', item.userId) ? () => deleteTask(item.id) : undefined}
              onToggleComplete={canEdit('tasks', item.userId) ? () => updateTask(item.id, { completed: !item.completed }) : undefined}
              style={styles.taskCard}
            />
          )}
          contentContainerStyle={styles.list}
          style={styles.listFlex}
        />
      )}

      {canCreate('tasks') && (
        <Pressable style={[styles.fab, { backgroundColor: primaryColor }]} onPress={() => { setEditingId(null); setFormVisible(true); }}>
          <Plus size={28} color="white" strokeWidth={3} />
        </Pressable>
      )}

      <TaskForm
        key={editingId ?? 'new'}
        visible={formVisible}
        isEditing={!!editingId}
        members={members}
        initialData={editingTask ? { title: editingTask.title, description: editingTask.description, dueDate: editingTask.dueDate, status: editingTask.status, assignedTo: editingTask.assignedTo } : undefined}
        onSubmit={editingId ? handleEdit : handleAdd}
        onClose={() => { setFormVisible(false); setEditingId(null); }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: spacing.lg },
  header: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  filterRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginBottom: spacing.lg, gap: spacing.sm, alignItems: 'center' },
  filterDivider: { width: 1, height: 20, backgroundColor: '#ccc', marginHorizontal: spacing.xs },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  filterTextActive: { color: 'white' },
  listFlex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: 80 },
  taskCard: { marginHorizontal: 0 },
  fab: { position: 'absolute', bottom: spacing.lg, right: spacing.lg, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4 },
});
