import { StyleSheet, View, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedCard } from '@/components/themed-card';
import { spacing } from '@/theme/theme';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Trash2, Calendar } from 'lucide-react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

type CalEvent = { id: string; title: string; date: string; description: string };

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function CalendarScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(toDateStr(now.getFullYear(), now.getMonth(), now.getDate()));
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
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

  const eventsByDate = events.reduce<Record<string, CalEvent[]>>((acc, e) => {
    acc[e.date] = acc[e.date] ? [...acc[e.date], e] : [e];
    return acc;
  }, {});

  const selectedEvents = eventsByDate[selectedDate] ?? [];

  const addEvent = () => {
    if (!newTitle.trim()) return;
    setEvents(prev => [...prev, { id: generateId(), title: newTitle.trim(), date: selectedDate, description: newDesc.trim() }]);
    setNewTitle(''); setNewDesc(''); setFormVisible(false);
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
            <ThemedCard key={event.id} variant="outlined" style={styles.eventCard}>
              <View style={[styles.eventAccent, { backgroundColor: primaryColor }]} />
              <View style={styles.eventBody}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                {event.description ? <ThemedText style={[styles.eventDesc, { color: mutedColor }]}>{event.description}</ThemedText> : null}
              </View>
              <Pressable onPress={() => setEvents(prev => prev.filter(e => e.id !== event.id))} hitSlop={8}>
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
              <View style={styles.modalForm}>
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
              </View>
              <View style={styles.modalFooter}>
                <Pressable onPress={() => setFormVisible(false)} style={[styles.footerBtn, { borderColor }]}>
                  <ThemedText style={styles.footerBtnText}>Cancel</ThemedText>
                </Pressable>
                <Pressable onPress={addEvent} style={[styles.footerBtn, { backgroundColor: primaryColor, borderColor: primaryColor }]}>
                  <ThemedText style={[styles.footerBtnText, { color: 'white' }]}>Save</ThemedText>
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
  eventTitle: { fontWeight: '600', fontSize: 15, marginBottom: 2 },
  eventDesc: { fontSize: 12 },
  modalWrapper: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalSheet: { borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingTop: spacing.lg },
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
