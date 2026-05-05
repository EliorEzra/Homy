import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../themed-text';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { radius } from '@/theme/radius';
import { lightModePalette } from '@/theme/palette';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export function Badge({ label, variant = 'primary' }: BadgeProps) {
  return (
    <View style={[styles.badge, styles[`badge_${variant}`]]}>
      <ThemedText style={[styles.text, styles[`text_${variant}`]]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  badge_primary: {
    backgroundColor: lightModePalette.primary[100],
  },
  badge_secondary: {
    backgroundColor: lightModePalette.secondary[100],
  },
  badge_danger: {
    backgroundColor: lightModePalette.error[100],
  },
  badge_warning: {
    backgroundColor: lightModePalette.warning[100],
  },
  text: {
    ...typography.label.sm,
    fontWeight: 'bold',
  },
  text_primary: {
    color: lightModePalette.primary.DEFAULT,
  },
  text_secondary: {
    color: lightModePalette.secondary.DEFAULT,
  },
  text_danger: {
    color: lightModePalette.error.DEFAULT,
  },
  text_warning: {
    color: lightModePalette.warning.DEFAULT,
  },
});
