import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";
import { ThemedCard } from "./themed-card";
import { ThemedBadge } from "./themed-badge";
import { Trash2, Edit, CheckCircle, Circle } from 'lucide-react-native';

export type TaskCardProps = {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status?: "todo" | "in-progress" | "done";
  completed?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleComplete?: () => void;
  style?: StyleProp<ViewStyle>;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'done':
      return <ThemedBadge label="Done" variant="success" size="sm" />;
    case 'in-progress':
      return <ThemedBadge label="In Progress" variant="warning" size="sm" />;
    default:
      return <ThemedBadge label="To Do" variant="primary" size="sm" />;
  }
};

export function TaskCard({
  id,
  title,
  description,
  dueDate,
  status = "todo",
  completed = false,
  onEdit,
  onDelete,
  onToggleComplete,
  style,
}: TaskCardProps) {
  const iconColor = useThemeColor({}, 'buttonBackground');
  const secondaryTextColor = useThemeColor({}, 'tabIconDefault');

  return (
    <ThemedCard
      variant="outlined"
      style={[
        styles.card,
        completed && styles.completedCard,
        style,
      ]}
    >
      <View style={styles.contentContainer}>
        {/* Left: Checkbox + Content */}
        <Pressable
          onPress={onToggleComplete}
          style={styles.contentLeft}
        >
          <View style={styles.checkboxContainer}>
            {completed ? (
              <CheckCircle size={24} color={iconColor} strokeWidth={2.5} />
            ) : (
              <Circle size={24} color={secondaryTextColor} strokeWidth={2} />
            )}
          </View>
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.title,
                typography.label.lg,
                completed && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {description && (
              <Text
                style={[
                  styles.description,
                  { color: secondaryTextColor },
                  completed && styles.completedText,
                ]}
                numberOfLines={1}
              >
                {description}
              </Text>
            )}
            {dueDate && (
              <Text style={[styles.dueDate, { color: secondaryTextColor }]}>
                Due: {dueDate}
              </Text>
            )}
          </View>
        </Pressable>

        {/* Right: Badge + Actions */}
        <View style={styles.rightContainer}>
          <View style={styles.badgeContainer}>
            {getStatusBadge(status)}
          </View>
          <View style={styles.actionsContainer}>
            <Pressable
              onPress={onEdit}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Edit size={18} color={iconColor} />
            </Pressable>
            <Pressable
              onPress={onDelete}
              hitSlop={8}
              style={styles.iconButton}
            >
              <Trash2 size={18} color="#ff3748" />
            </Pressable>
          </View>
        </View>
      </View>
    </ThemedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  completedCard: {
    opacity: 0.6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkboxContainer: {
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  description: {
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  rightContainer: {
    alignItems: 'flex-end',
    marginLeft: spacing.md,
  },
  badgeContainer: {
    marginBottom: spacing.sm,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    padding: spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
