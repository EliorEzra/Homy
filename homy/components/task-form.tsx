import React, { useState } from "react";
import { View, StyleSheet, Modal, Pressable, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { spacing } from '@/theme/theme';
import { ThemedFormField } from "./themed-form-field";
import { ThemedButton } from "./themed-button";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { useThemeColor } from "@/hooks/use-theme-color";
import { X, Calendar, Clock } from 'lucide-react-native';

export type TaskFormData = {
  title: string; description: string; dueDate: string;
  status: "todo" | "in-progress" | "done";
}

export type TaskFormProps = {
  visible: boolean; initialData?: TaskFormData; isEditing?: boolean;
  onSubmit: (data: TaskFormData) => void; onClose: () => void;
}

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatFull(date: Date) {
  return `${formatDate(date)} · ${formatTime(date)}`;
}

function parseDueDate(str: string): Date {
  const d = new Date(str);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function TaskForm({ visible, initialData, isEditing = false, onSubmit, onClose }: TaskFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [dueDate, setDueDate] = useState<Date | null>(
    initialData?.dueDate ? parseDueDate(initialData.dueDate) : null
  );
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">(initialData?.status || "todo");
  const [errors, setErrors] = useState<{ title?: string }>({});

  // Android shows date and time pickers separately
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  // iOS shows both in one inline picker
  const [showIOSPicker, setShowIOSPicker] = useState(false);
  const [iosPickerMode, setIosPickerMode] = useState<"date" | "time">("date");

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const mutedColor = useThemeColor({}, 'tabIconDefault');

  const reset = () => {
    setTitle(""); setDescription(""); setDueDate(null);
    setStatus("todo"); setErrors({});
    setShowDatePicker(false); setShowTimePicker(false); setShowIOSPicker(false);
  };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = () => {
    if (!title.trim()) { setErrors({ title: "Task title is required" }); return; }
    onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate ? dueDate.toISOString() : "",
      status,
    });
    reset();
  };

  const onAndroidDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowDatePicker(false);
    if (event.type === "set" && selected) {
      const updated = dueDate ? new Date(dueDate) : new Date();
      updated.setFullYear(selected.getFullYear(), selected.getMonth(), selected.getDate());
      setDueDate(updated);
      setShowTimePicker(true);
    }
  };

  const onAndroidTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (event.type === "set" && selected) {
      const updated = dueDate ? new Date(dueDate) : new Date();
      updated.setHours(selected.getHours(), selected.getMinutes());
      setDueDate(updated);
    }
  };

  const onIOSChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (selected) setDueDate(selected);
  };

  const openPicker = () => {
    if (Platform.OS === "ios") {
      setIosPickerMode("date");
      setShowIOSPicker(true);
    } else {
      setShowDatePicker(true);
    }
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

              {/* Due Date / Time */}
              <View style={styles.dateSection}>
                <ThemedText style={styles.dateLabel}>Due Date (optional)</ThemedText>
                <Pressable
                  onPress={openPicker}
                  style={[styles.dateBtn, { borderColor }]}
                >
                  <Calendar size={16} color={dueDate ? primaryColor : mutedColor} />
                  <ThemedText style={[styles.dateBtnText, { color: dueDate ? primaryColor : mutedColor }]}>
                    {dueDate ? formatDate(dueDate) : "Pick a date"}
                  </ThemedText>
                  {dueDate && (
                    <>
                      <View style={[styles.dateDivider, { backgroundColor: borderColor }]} />
                      <Clock size={16} color={primaryColor} />
                      <ThemedText
                        style={[styles.dateBtnText, { color: primaryColor }]}
                        onPress={Platform.OS === "ios" ? () => { setIosPickerMode("time"); setShowIOSPicker(true); } : () => setShowTimePicker(true)}
                      >
                        {formatTime(dueDate)}
                      </ThemedText>
                    </>
                  )}
                  {dueDate && (
                    <Pressable hitSlop={8} onPress={() => setDueDate(null)} style={styles.clearDate}>
                      <X size={14} color={mutedColor} />
                    </Pressable>
                  )}
                </Pressable>

                {/* iOS inline picker */}
                {Platform.OS === "ios" && showIOSPicker && (
                  <View style={[styles.iosPicker, { borderColor }]}>
                    <View style={styles.iosPickerHeader}>
                      <Pressable onPress={() => setIosPickerMode(m => m === "date" ? "time" : "date")}>
                        <ThemedText style={[styles.iosToggle, { color: primaryColor }]}>
                          {iosPickerMode === "date" ? "Switch to Time" : "Switch to Date"}
                        </ThemedText>
                      </Pressable>
                      <Pressable onPress={() => setShowIOSPicker(false)}>
                        <ThemedText style={[styles.iosToggle, { color: primaryColor }]}>Done</ThemedText>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={dueDate ?? new Date()}
                      mode={iosPickerMode}
                      display="spinner"
                      onChange={onIOSChange}
                      style={styles.iosPickerWidget}
                    />
                  </View>
                )}

                {/* Android date picker */}
                {Platform.OS === "android" && showDatePicker && (
                  <DateTimePicker
                    value={dueDate ?? new Date()}
                    mode="date"
                    display="spinner"
                    onChange={onAndroidDateChange}
                  />
                )}
                {/* Android time picker (shown after date is picked) */}
                {Platform.OS === "android" && showTimePicker && (
                  <DateTimePicker
                    value={dueDate ?? new Date()}
                    mode="time"
                    display="clock"
                    onChange={onAndroidTimeChange}
                  />
                )}
              </View>

              {/* Status */}
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
  dateSection: { marginBottom: spacing.md },
  dateLabel: { fontWeight: '600', marginBottom: spacing.xs },
  dateBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  dateBtnText: { fontSize: 14, fontWeight: '500' },
  dateDivider: { width: 1, height: 16 },
  clearDate: { marginLeft: 'auto' },
  iosPicker: { borderWidth: 1, borderRadius: 12, marginTop: spacing.sm, overflow: 'hidden' },
  iosPickerHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  iosToggle: { fontWeight: '600', fontSize: 14 },
  iosPickerWidget: { height: 200 },
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
