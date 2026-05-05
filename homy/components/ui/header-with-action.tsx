import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Heading, Body } from './typography';
import { ThemedView } from '../themed-view';
import { spacing } from '@/theme/spacing';
import { lightModePalette } from '@/theme/palette';

interface HeaderWithActionProps {
  title: string;
  actionText?: string;
  onActionPress?: () => void;
}

export function HeaderWithAction({ title, actionText, onActionPress }: HeaderWithActionProps) {
  return (
    <ThemedView style={styles.container}>
      <Heading level={3} color={lightModePalette.onSurface}>{title}</Heading>
      {actionText && (
        <TouchableOpacity onPress={onActionPress}>
          <Body color={lightModePalette.primary.DEFAULT} style={styles.action}>
            {actionText}
          </Body>
        </TouchableOpacity>
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
  action: {
    fontWeight: '600',
  },
});
