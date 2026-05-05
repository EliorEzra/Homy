import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { ThemedView } from '../themed-view';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { lightModePalette } from '@/theme/palette';

interface HeaderWithActionProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function HeaderWithAction({ title, actionText, onActionPress }: HeaderWithActionProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {actionText && (
        <ThemedText
          style={styles.action}
          onPress={onActionPress}
        >
          {actionText}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.heading[3],
    color: lightModePalette.onSurface,
  },
  action: {
    ...typography.label.md,
    color: lightModePalette.primary.DEFAULT,
  },
});
