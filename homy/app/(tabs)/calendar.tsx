import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/themed-button';
import { ThemedEmptyState } from '@/components/themed-empty-state';
import { ThemedFormField } from '@/components/themed-form-field';
import { ThemedCard } from '@/components/themed-card';
import { ThemedDivider } from '@/components/themed-divider';
import { useThemeColor } from '@/hooks/use-theme-color';
import { spacing } from '@/theme/theme';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  CalendarDays,
  X,
} from 'lucide-react-native';

type Event = {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
};

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const toDateString = (year: number, month: number, day: number): string => {
  const mm = String(month + 1).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
};

const todayString = toDateString(
  new Date().getFullYear(),
  new Date().getMonth(),
  new Date().getDate()
);

export default function CalendarScreen() {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(todayString);
  const [events, setEvents] = useState<Event[]>([]);
  const [formVisible, setFormVisible] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formErrors, setFormErrors] = useState<{ title?: string }>({});

  const primaryColor = useThemeColor({}, 'buttonBackground');
  const textColor = useThemeColor({}, 'text');
  const bgColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'inputBorder');

  // Build calendar grid
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const eventsForSelectedDate = events.filter(e => e.date === selectedDate);

  const openAddForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormErrors({});
    setFormVisible(true);
  };

  const handleAddEvent = () => {
    if (!formTitle.trim()) {
      setFormErrors({ title: 'Event title is required' });
      return;
    }
    setEvents(prev => [
      ...prev,
      { id: generateId(), title: formTitle.trim(), description: formDescription.trim(), date: selectedDate },
    ]);
    setFormVisible(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const hasEvent = (day: number) =>
    events.some(e => e.date === toDateString(viewYear, viewMonth, day));

  const selectedDateLabel = (() => {
    const [y, m, d] = selectedDate.split('-').map(Number);
    return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
  })();

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month header */}
        <View style={styles.monthHeader}>
          <Pressable onPress={prevMonth} hitSlop={8} style={styles.navButton}>
            <ChevronLeft size={24} color={primaryColor} />
          </Pressable>
          <ThemedText type="subtitle" style={styles.monthTitle}>
            {MONTH_NAMES[viewMonth]} {viewYear}
          </ThemedText>
          <Pressable onPress={nextMonth} hitSlop={8} style={styles.navButton}>
            <ChevronRight size={24} color={primaryColor} />
          </Pressable>
        </View>

        {/* Day-of-week labels */}
        <View style={styles.weekRow}>
          {DAYS_OF_WEEK.map(d => (
            <View key={d} style={styles.weekCell}>
              <ThemedText style={[styles.weekLabel, { color: borderColor }]}>{d}</ThemedText>
            </View>
          ))}
        </View>

        <ThemedDivider style={styles.divider} />

        {/* Calendar grid */}
        <View style={styles.grid}>
          {calendarCells.map((day, idx) => {
            if (day === null) return <View key={`empty-${idx}`} style={styles.dayCell} />;

            const dateStr = toDateString(viewYear, viewMonth, day);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === todayString;
            const hasEvents = hasEvent(day);

            return (
              <Pressable
                key={dateStr}
                style={[
                  styles.dayCell,
                  isSelected && { backgroundColor: primaryColor, borderRadius: 8 },
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <ThemedText
                  style={[
                    styles.dayNumber,
                    isSelected && styles.selectedDayText,
                    isToday && !isSelected && { color: primaryColor, fontWeight: '700' },
                  ]}
                >
                  {day}
                </ThemedText>
                {hasEvents && (
                  <View style={[styles.dot, isSelected && styles.dotSelected]} />
                )}
              </Pressable>
            );
          })}
        </View>

        <ThemedDivider style={styles.divider} />

        {/* Selected date events */}
        <View style={styles.eventsSection}>
          <View style={styles.eventsSectionHeader}>
            <ThemedText type="subtitle" style={styles.eventsTitle}>
              {selectedDateLabel}
            </ThemedText>
            <Pressable onPress={openAddForm} style={[styles.addBtn, { backgroundColor: primaryColor }]}>
              <Plus size={16} color="white" strokeWidth={3} />
              <ThemedText style={styles.addBtnText}>Add</ThemedText>
            </Pressable>
          </View>

          {eventsForSelectedDate.length === 0 ? (
            <ThemedEmptyState
              title="No Events"
              description="Tap Add to create an event for this day"
              icon={<CalendarDays size={48} color={primaryColor} opacity={0.4} />}
            />
          ) : (
            eventsForSelectedDate.map(event => (
              <ThemedCard key={event.id} variant="elevated" style={styles.eventCard}>
                <View style={styles.eventRow}>
                  <View style={styles.eventInfo}>
                    <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                    {event.description ? (
                      <ThemedText style={styles.eventDesc}>{event.description}</ThemedText>
                    ) : null}
                  </View>
                  <Pressable onPress={() => handleDeleteEvent(event.id)} hitSlop={8}>
                    <Trash2 size={18} color="#ff3748" />
                  </Pressable>
                </View>
              </ThemedCard>
            ))
          )}
        </View>
      </ScrollView>

      {/* Add Event Modal */}
      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalWrapper}>
          <ThemedView style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { backgroundColor: bgColor }]}>
              <View style={styles.modalHeader}>
                <ThemedText type="subtitle">New Event</ThemedText>
                <Pressable onPress={() => setFormVisible(false)} hitSlop={8}>
                  <X size={22} color={primaryColor} />
                </Pressable>
              </View>
              <ThemedText style={[styles.modalDateLabel, { color: borderColor }]}>
                {selectedDateLabel}
              </ThemedText>
              <ThemedFormField
                label="Title"
                placeholder="Event title"
                value={formTitle}
                onChangeText={t => { setFormTitle(t); if (formErrors.title) setFormErrors({}); }}
                error={formErrors.title}
                required
                style={styles.formField}
              />
              <ThemedFormField
                label="Description (optional)"
                placeholder="Details"
                value={formDescription}
                onChangeText={setFormDescription}
                inputProps={{ multiline: true, numberOfLines: 2 }}
                style={styles.formField}
              />
              <View style={styles.modalFooter}>
                <ThemedButton title="Cancel" onPress={() => setFormVisible(false)} style={styles.footerBtn} />
                <ThemedButton title="Add Event" onPress={handleAddEvent} style={styles.footerBtn} />
              </View>
            </View>
          </ThemedView>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: spacing.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  monthTitle: {
    fontSize: 20,
  },
  navButton: {
    padding: spacing.sm,
  },
  weekRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  weekLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  divider: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.sm,
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedDayText: {
    color: 'white',
    fontWeight: '700',
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ff5c02',
    marginTop: 2,
  },
  dotSelected: {
    backgroundColor: 'white',
  },
  eventsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  eventsTitle: {
    fontSize: 18,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  eventCard: {
    marginBottom: spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  eventTitle: {
    fontWeight: '600',
    fontSize: 15,
  },
  eventDesc: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  // Modal
  modalWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  modalDateLabel: {
    fontSize: 13,
    marginBottom: spacing.md,
  },
  formField: {
    marginBottom: spacing.sm,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  footerBtn: {
    flex: 1,
  },
});
