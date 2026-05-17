import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { spacing } from '@/theme/theme';
import { ThemedFormField } from "./themed-form-field";
import { ThemedButton } from "./themed-button";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { X } from 'lucide-react-native';

export type TaskFormData = {
  title: string;
  description: string;
  dueDate: string;
  status: "todo" | "in-progress" | "done";
}

export type TaskFormProps = {
  visible: boolean;
  initialData?: TaskFormData;
  isEditing?: boolean;
  onSubmit: (data: TaskFormData) => void;
  onClose: () => void;
}

export function TaskForm({
  visible,
  initialData,
  isEditing = false,
  onSubmit,
  onClose,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState(initialData?.dueDate || "");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(
    initialData?.status || "todo"
  );
  const [errors, setErrors] = useState<{ title?: string }>({});

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setStatus("todo");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Task title is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        title: title.trim(),
        description: description.trim(),
        dueDate: dueDate.trim(),
        status,
      });
      resetForm();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.overlay}>
          <ThemedView style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <ThemedText type="subtitle">
                {isEditing ? "Edit Task" : "New Task"}
              </ThemedText>
              <Pressable
                onPress={handleClose}
                hitSlop={8}
                style={styles.closeButton}
              >
                <X size={24} color="#ff5c02" />
              </Pressable>
            </View>

            {/* Form */}
            <ScrollView
              style={styles.formContainer}
              showsVerticalScrollIndicator={false}
            >
              <ThemedFormField
                label="Task Title"
                placeholder="Enter task title"
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  if (errors.title) setErrors({});
                }}
                error={errors.title}
                required
              />

              <ThemedFormField
                label="Description (optional)"
                placeholder="Enter task description"
                value={description}
                onChangeText={setDescription}
                inputProps={{
                  multiline: true,
                  numberOfLines: 3,
                }}
              />

              <ThemedFormField
                label="Due Date (optional)"
                placeholder="e.g., 2024-12-25"
                value={dueDate}
                onChangeText={setDueDate}
              />

              <View style={styles.statusSection}>
                <ThemedText style={styles.statusLabel}>Status</ThemedText>
                <View style={styles.statusButtons}>
                  {(["todo", "in-progress", "done"] as const).map((s) => (
                    <Pressable
                      key={s}
                      onPress={() => setStatus(s)}
                      style={[
                        styles.statusButton,
                        status === s && styles.statusButtonActive,
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusButtonText,
                          status === s && styles.statusButtonTextActive,
                        ]}
                      >
                        {s === "todo"
                          ? "To Do"
                          : s === "in-progress"
                          ? "In Progress"
                          : "Done"}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
              <ThemedButton
                title="Cancel"
                onPress={handleClose}
                style={styles.cancelButton}
              />
              <ThemedButton
                title={isEditing ? "Update" : "Create"}
                onPress={handleSubmit}
                style={styles.submitButton}
              />
            </View>
          </ThemedView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    minHeight: '80%',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: spacing.sm,
  },
  formContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusSection: {
    marginVertical: spacing.md,
  },
  statusLabel: {
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#ff5c02',
    borderColor: '#ff5c02',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusButtonTextActive: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
});
