import { StyleSheet, View, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar, Clock } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useEvents } from '@/context/events_db';
import { Models } from 'react-native-appwrite';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toTimeStr(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatTime(time: string) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
}

function sortByTime(a: { time: string }, b: { time: string }) {
  return a.time.localeCompare(b.time);
}

export default function CalendarScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(now.getFullYear(), now.getMonth(), now.getDate()));
  const { events, addEvent, deleteEvent } = useEvents();
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState<Date>(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showIOSTimePicker, setShowIOSTimePicker] = useState(false);
  const primaryColor = useThemeColor({}, 'buttonBackground');
  const borderColor = useThemeColor({}, 'inputBorder');
  const inputBg = useThemeColor({}, 'inputBackground');
  const mutedColor = useThemeColor({}, 'tabIconDefault');
  const textColor = useThemeColor({}, 'text');

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const eventsByDate = (events ?? []).reduce<Record<string, Models.Row[]>>((acc, e) => {
    const d = e.date as string;
    acc[d] = acc[d] ? [...acc[d], e] : [e];
    return acc;
  }, {});

  const selectedEvents = [...(eventsByDate[selectedDate] ?? [])].sort((a, b) => (a.time as string).localeCompare(b.time as string));

  const handleAddEvent = async () => {
    if (!newTitle.trim()) return;
    setSaving(true);
    const { error } = await addEvent({ title: newTitle.trim(), date: selectedDate, time: toTimeStr(newTime), description: newDesc.trim() }, []);
    setSaving(false);
    if (error) {
      Alert.alert("Error", error?.message ?? "Could not save event.");
      return;
    }
    setNewTitle(''); setNewDesc(''); setNewTime(new Date()); setFormVisible(false);
  };

  const onTimeChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setShowTimePicker(false);
    if (selected) setNewTime(selected);
  };

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <ThemedView style={styles.header}><ThemedText type="title">Calendar</ThemedText></ThemedView>

        <ThemedCard variant="elevated" style={styles.calCard}>
          <View style={styles.navRow}>
            <Pressable onPress={prevMonth} hitSlop={8}><ChevronLeft size={22} color={primaryColor} /></Pressable>
            <ThemedText style={styles.monthLabel}>{MONTH_NAMES[viewMonth]} {viewYear}</ThemedText>
            <Pressable onPress={nextMonth} hitSlop={8}><ChevronRight size={22} color={primaryColor} /></Pressable>
          </View>

          <View style={styles.dayLabels}>
            {DAY_LABELS.map(d => (
              <View key={d} style={styles.dayLabelCell}>
                <ThemedText style={[styles.dayLabelText, { color: mutedColor }]}>{d}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.grid}>
            {cells.map((day, idx) => {
              if (day === null) return <View key={`empty-${idx}`} style={styles.cell} />;
              const dateStr = toDateStr(viewYear, viewMonth, day);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const hasEvents = !!eventsByDate[dateStr]?.length;
              return (
                <Pressable key={dateStr} style={styles.cell} onPress={() => setSelectedDate(dateStr)}>
                  <View style={[
                    styles.dayCircle,
                    isSelected && { backgroundColor: primaryColor },
                    isToday && !isSelected && { borderWidth: 1.5, borderColor: primaryColor },
                  ]}>
                    <ThemedText style={[styles.dayNum, isSelected && { color: 'white' }]}>{day}</ThemedText>
                  </View>
                  {hasEvents && <View style={[styles.dot, { backgroundColor: isSelected ? 'white' : primaryColor }]} />}
                </Pressable>
              );
            })}
          </View>
        </ThemedCard>

        <View style={styles.eventsSection}>
          <View style={styles.eventsHeader}>
            <ThemedText style={styles.eventsTitle}>
              {selectedDate === todayStr ? "Today's Events" : selectedDate}
            </ThemedText>
            <Pressable onPress={() => setFormVisible(true)} style={[styles.addEventBtn, { backgroundColor: primaryColor }]}>
              <Plus size={16} color="white" strokeWidth={3} />
              <ThemedText style={styles.addEventText}>Add</ThemedText>
            </Pressable>
          </View>

          {selectedEvents.length === 0 ? (
            <ThemedCard variant="outlined" style={styles.emptyEvents}>
              <Calendar size={32} color={mutedColor} opacity={0.5} />
              <ThemedText style={[styles.emptyEventsText, { color: mutedColor }]}>No events this day</ThemedText>
            </ThemedCard>
          ) : selectedEvents.map(event => (
            <ThemedCard key={event.$id} variant="outlined" style={styles.eventCard}>
              <View style={[styles.eventAccent, { backgroundColor: primaryColor }]} />
              <View style={styles.eventBody}>
                <View style={styles.eventTimeRow}>
                  <Clock size={12} color={mutedColor} />
                  <ThemedText style={[styles.eventTime, { color: mutedColor }]}>{formatTime(event.time as string)}</ThemedText>
                </View>
                <ThemedText style={styles.eventTitle}>{event.title as string}</ThemedText>
                {event.description ? <ThemedText style={[styles.eventDesc, { color: mutedColor }]}>{event.description as string}</ThemedText> : null}
              </View>
              <Pressable onPress={() => deleteEvent(event.$id)} hitSlop={8} style={styles.deleteBtn}>
                <Trash2 size={16} color="#ff3748" />
              </Pressable>
            </ThemedCard>
          ))}
        </View>
      </ScrollView>

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <View style={styles.modalOverlay}>
            <ThemedView style={styles.modalSheet}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">Add Event</ThemedText>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={8}>
                  <X size={24} color={primaryColor} />
                </Pressable>
              </View>
              <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>
                <ThemedText style={styles.fieldLabel}>Date</ThemedText>
                <ThemedText style={[styles.dateDisplay, { color: primaryColor }]}>{selectedDate}</ThemedText>

                <ThemedText style={styles.fieldLabel}>Title</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Event title"
                  placeholderTextColor={mutedColor}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  autoFocus
                />

                <ThemedText style={styles.fieldLabel}>Time</ThemedText>
                <Pressable
                  onPress={() => Platform.OS === 'ios' ? setShowIOSTimePicker(v => !v) : setShowTimePicker(true)}
                  style={[styles.timeBtn, { borderColor }]}
                >
                  <Clock size={16} color={primaryColor} />
                  <ThemedText style={[styles.timeBtnText, { color: primaryColor }]}>{formatTime(toTimeStr(newTime))}</ThemedText>
                </Pressable>

                {/* iOS inline spinner */}
                {Platform.OS === 'ios' && showIOSTimePicker && (
                  <View style={[styles.iosPicker, { borderColor }]}>
                    <DateTimePicker
                      value={newTime}
                      mode="time"
                      display="spinner"
                      onChange={onTimeChange}
                    />
                  </View>
                )}

                {/* Android clock picker */}
                {Platform.OS === 'android' && showTimePicker && (
                  <DateTimePicker
                    value={newTime}
                    mode="time"
                    display="spinner"
                    onChange={onTimeChange}
                  />
                )}

                <ThemedText style={styles.fieldLabel}>Description (optional)</ThemedText>
                <TextInput
                  style={[styles.input, styles.inputMulti, { backgroundColor: inputBg, borderColor, color: textColor }]}
                  placeholder="Add details..."
                  placeholderTextColor={mutedColor}
                  value={newDesc}
                  onChangeText={setNewDesc}
                  multiline
                  numberOfLines={3}
                />
              </ScrollView>

              <View style={styles.modalFooter}>
                <Pressable onPress={() => setFormVisible(false)} style={[styles.footerBtn, { borderColor }]}>
                  <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={handleAddEvent} disabled={saving} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor, opacity: saving ? 0.6 : 1 }]}>
                  <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>{saving ? 'Saving...' : 'Save'}</ThemedText>
                </Pressable>
              </View>
            </ThemedView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: spacing.xl * 2 },
  header: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, marginBottom: spacing.md },
  calCard: { marginHorizontal: spacing.lg, marginBottom: spacing.lg },
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  monthLabel: { fontWeight: '700', fontSize: 16 },
  dayLabels: { flexDirection: 'row', marginBottom: spacing.xs },
  dayLabelCell: { flex: 1, alignItems: 'center' },
  dayLabelText: { fontSize: 11, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', marginBottom: spacing.sm },
  dayCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 14, fontWeight: '500' },
  dot: { width: 5, height: 5, borderRadius: 3, marginTop: 2 },
  eventsSection: { paddingHorizontal: spacing.lg },
  eventsHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  eventsTitle: { fontWeight: '700', fontSize: 16 },
  addEventBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 20 },
  addEventText: { color: 'white', fontWeight: '700', fontSize: 13 },
  emptyEvents: { alignItems: 'center', paddingVertical: spacing.lg, gap: spacing.sm },
  emptyEventsText: { fontSize: 14 },
  eventCard: { marginBottom: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm, paddingHorizontal: 0, overflow: 'hidden' },
  eventAccent: { width: 4, alignSelf: 'stretch', borderRadius: 2, marginLeft: spacing.sm },
  eventBody: { flex: 1, paddingRight: spacing.xs },
  eventTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  eventTime: { fontSize: 11, fontWeight: '600' },
  eventTitle: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  eventDesc: { fontSize: 12 },
  deleteBtn: { paddingRight: spacing.sm },
  timeBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm + 2 },
  timeBtnText: { fontSize: 15, fontWeight: '600' },
  iosPicker: { borderWidth: 1, borderRadius: 12, marginTop: spacing.sm, overflow: 'hidden' },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.1)' },
  modalForm: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  fieldLabel: { fontWeight: '600', marginBottom: spacing.xs, marginTop: spacing.sm },
  dateDisplay: { fontWeight: '700', fontSize: 15, marginBottom: spacing.sm },
  input: { borderRadius: 8, borderWidth: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, fontSize: 14 },
  inputMulti: { minHeight: 72, textAlignVertical: 'top' },
  modalFooter: { flexDirection: 'row', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)' },
  footerBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm + 2, borderRadius: 10, borderWidth: 1 },
  footerBtnText: { fontWeight: '700', fontSize: 15 },
});
