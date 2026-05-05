import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './card';
import { Body, Caption } from './typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
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
      <Card
        style={styles.taskCard}
        padding="md"
        variant="elevated"
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.checkbox} onPress={onToggle}>
            <View
              style={[
                styles.checkboxInner,
                completed && styles.checkboxChecked,
              ]}
            >
              {completed && (
                <Body color={lightModePalette.neutral[100]} style={{ fontSize: 14 }}>
                  ✓
                </Body>
              )}
            </View>
          </TouchableOpacity>

          <View style={styles.textContent}>
            <Body
              size="md"
              color={completed ? lightModePalette.neutral[500] : lightModePalette.onSurface}
              style={completed ? { textDecorationLine: 'line-through' } : {}}
            >
              {title}
            </Body>
            <Caption color={lightModePalette.onSurfaceVariant}>{dueTime}</Caption>
          </View>
        </View>

        <ChevronRight
          size={20}
          color={lightModePalette.onSurfaceVariant}
          strokeWidth={2}
        />
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  textContent: {
    flex: 1,
  },
});
