import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { shadows } from '@/theme/shadows';
import { lightModePalette } from '@/theme/palette';

interface EventCardProps {
  icon: React.ReactNode;
  time: string;
  title: string;
  location: string;
  highlighted?: boolean;
  onPress?: () => void;
}

export function EventCard({ icon, time, title, location, highlighted = false, onPress }: EventCardProps) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView
        style={[
          styles.card,
          highlighted && styles.highlighted,
          shadows.md,
        ]}
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.content}>
          <ThemedText style={styles.time}>{time}</ThemedText>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.location}>{location}</ThemedText>
        </View>
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
    marginRight: spacing.md,
    minWidth: 280,
  },
  highlighted: {
    borderColor: lightModePalette.primary.DEFAULT,
    borderWidth: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: lightModePalette.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  time: {
    ...typography.label.sm,
    color: lightModePalette.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.label.lg,
    color: lightModePalette.onSurface,
    marginBottom: spacing.xs,
  },
  location: {
    ...typography.body.sm,
    color: lightModePalette.onSurfaceVariant,
  },
});
