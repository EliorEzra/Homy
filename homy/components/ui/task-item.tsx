import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';
import { ChevronRight } from 'lucide-react-native';

interface TaskItemProps {
  title: string;
  dueTime: string;
  completed?: boolean;
  onPress?: () => void;
  onToggle?: () => void;
}

export function TaskItem({ title, dueTime, completed = false, onPress, onToggle }: TaskItemProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView style={[styles.card, shadows.sm]}>
        <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
          <View
            style={[
              styles.checkboxInner,
              completed && styles.checkboxChecked,
            ]}
          >
            {completed && (
              <ThemedText style={styles.checkmark}>✓</ThemedText>
            )}
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <ThemedText
            style={[
              styles.title,
              completed && styles.titleCompleted,
            ]}
          >
            {title}
          </ThemedText>
          <ThemedText style={styles.dueTime}>{dueTime}</ThemedText>
        </View>

        <ChevronRight
          size={20}
          color={lightModePalette.onSurfaceVariant}
          strokeWidth={2}
        />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: lightModePalette.surface,
    borderWidth: 2,
    borderColor: lightModePalette.outline,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  checkbox: {
    marginRight: spacing.md,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: lightModePalette.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: lightModePalette.primary.DEFAULT,
    borderColor: lightModePalette.primary.DEFAULT,
  },
  checkmark: {
    color: lightModePalette.neutral[100],
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.label.lg,
    color: lightModePalette.onSurface,
    marginBottom: spacing.xs,
  },
  titleCompleted: {
    color: lightModePalette.neutral[500],
    textDecorationLine: 'line-through',
  },
  dueTime: {
    ...typography.body.sm,
    color: lightModePalette.onSurfaceVariant,
  },
});
