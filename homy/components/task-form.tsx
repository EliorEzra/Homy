import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { spacing } from '@/theme/theme';
import { ThemedFormField } from "./themed-form-field";
import { ThemedButton } from "./themed-button";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { X } from 'lucide-react-native';

export type TaskFormData = {
  title: string; description: string; dueDate: string;
  status: "todo" | "in-progress" | "done";
}

export type TaskFormProps = {
  visible: boolean; initialData?: TaskFormData; isEditing?: boolean;
  onSubmit: (data: TaskFormData) => void; onClose: () => void;
}

export function TaskForm({ visible, initialData, isEditing = false, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(initialData?.status || "todo");
  const [errors, setErrors] = useState<{ title?: string }>({});

  const reset = () => { setTitle(""); setDescription(""); setDueDate(""); setStatus("todo"); setErrors({}); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!title.trim()) { setErrors({ title: "Task title is required" }); return; }
    onSubmit({ title: title.trim(), description: description.trim(), dueDate: dueDate.trim(), status });
    reset();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.wrapper}>
        <View style={styles.overlay}>
          <ThemedView style={styles.sheet}>
            <View style={styles.header}>
              <ThemedText type="subtitle">{isEditing ? "Edit Task" : "New Task"}</ThemedText>
              <Pressable onPress={handleClose} hitSlop={8}><X size={24} color="#ff5c02" /></Pressable>
            </View>
            <ScrollView style={styles.form} showsVerticalScrollIndicator={false}>
              <ThemedFormField label="Task Title" placeholder="Enter task title" value={title}
                onChangeText={t => { setTitle(t); if (errors.title) setErrors({}); }}
                error={errors.title} required />
              <ThemedFormField label="Description (optional)" placeholder="Enter task description" value={description}
                onChangeText={setDescription} inputProps={{ multiline: true, numberOfLines: 3 }} />
              <ThemedFormField label="Due Date (optional)" placeholder="e.g., 2024-12-25" value={dueDate} onChangeText={setDueDate} />
              <View style={styles.statusSection}>
                <ThemedText style={styles.statusLabel}>Status</ThemedText>
                <View style={styles.statusRow}>
                  {(["todo", "in-progress", "done"] as const).map(s => (
                    <Pressable key={s} onPress={() => setStatus(s)}
                      style={[styles.statusBtn, status === s && styles.statusBtnActive]}>
                      <ThemedText style={[styles.statusText, status === s && styles.statusTextActive]}>
                        {s === "todo" ? "To Do" : s === "in-progress" ? "In Progress" : "Done"}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>
            <View style={styles.footer}>
              <ThemedButton title="Cancel" onPress={handleClose} style={styles.footerBtn} />
              <ThemedButton title={isEditing ? "Update" : "Create"} onPress={handleSubmit} style={styles.footerBtn} />
            </View>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, justifyContent: 'flex-end' },
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { minHeight: '80%', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  form: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  statusSection: { marginVertical: spacing.md },
  statusLabel: { marginBottom: spacing.sm, fontWeight: '600' },
  statusRow: { flexDirection: 'row', gap: spacing.sm },
  statusBtn: { flex: 1, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)', alignItems: 'center' },
  statusBtnActive: { backgroundColor: '#ff5c02', borderColor: '#ff5c02' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextActive: { color: 'white' },
  footer: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1 },
});
