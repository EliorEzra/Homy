import React from "react";
import { View, Text, Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedCard } from "./themed-card";
import { ThemedBadge } from "./themed-badge";
import { Trash2, Edit, CheckCircle, Circle } from 'lucide-react-native';

export type TaskCardProps = {
  id: string; title: string; description?: string; dueDate?: string;
  status?: "todo" | "in-progress" | "done"; completed?: boolean;
  assignedTo?: string;
  onEdit?: () => void; onDelete?: () => void; onToggleComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

const getStatusBadge = (status?: string) => {
  if (status === 'done') return <ThemedBadge label="Done" variant="success" size="sm" />;
  if (status === 'in-progress') return <ThemedBadge label="In Progress" variant="warning" size="sm" />;
  return <ThemedBadge label="To Do" variant="primary" size="sm" />;
};

export function TaskCard({ title, description, dueDate, status = "todo", completed = false, assignedTo, onEdit, onDelete, onToggleComplete, style }: TaskCardProps) {
  const iconColor = useThemeColor({}, 'buttonBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');

  return (
    <ThemedCard variant="outlined" style={[styles.card, completed && styles.completedCard, style]}>
      <View style={styles.row}>
        <Pressable onPress={onToggleComplete} style={styles.left}>
          <View style={styles.checkbox}>
            {completed ? <CheckCircle size={24} color={iconColor} strokeWidth={2.5} /> : <Circle size={24} color={mutedColor} strokeWidth={2} />}
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.title, { color: textColor }, completed && styles.struck]} numberOfLines={1}>{title}</Text>
            {description ? <Text style={[styles.desc, { color: mutedColor }, completed && styles.struck]} numberOfLines={1}>{description}</Text> : null}
            {dueDate ? <Text style={[styles.due, { color: mutedColor }]}>Due: {(() => { const d = new Date(dueDate); return isNaN(d.getTime()) ? dueDate : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }); })()}</Text> : null}
            {assignedTo ? <Text style={[styles.due, { color: mutedColor }]}>👤 {assignedTo}</Text> : null}
          </View>
        </Pressable>
        <View style={styles.right}>
          {getStatusBadge(status)}
          {(onEdit || onDelete) && (
            <View style={styles.actions}>
              {onEdit && <Pressable onPress={onEdit} hitSlop={8} style={styles.iconBtn}><Edit size={18} color={iconColor} /></Pressable>}
              {onDelete && <Pressable onPress={onDelete} hitSlop={8} style={styles.iconBtn}><Trash2 size={18} color="#ff3748" /></Pressable>}
            </View>
          )}
        </View>
      </View>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: { marginVertical: spacing.sm, paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  completedCard: { opacity: 0.6 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  checkbox: { marginRight: spacing.md, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  textBox: { flex: 1 },
  title: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  desc: { fontSize: 12, marginBottom: 2 },
  due: { fontSize: 11, fontWeight: '500' },
  struck: { textDecorationLine: 'line-through', opacity: 0.6 },
  right: { alignItems: 'flex-end', marginLeft: spacing.md },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
  iconBtn: { padding: spacing.xs, justifyContent: 'center', alignItems: 'center' },
});
