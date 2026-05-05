import { ViewProps } from 'react-native';
import { ThemedView } from '../themed-view';
import { StyleSheet } from 'react-native';
import { shadows } from '@/theme/shadows';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { lightModePalette } from '@/theme/palette';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'flat';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'elevated',
  padding = 'md',
  children,
  style,
  ...rest
}: CardProps) {
  const shadowStyle = variant === 'elevated' ? shadows.sm : {};
  const paddingValue = {
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
  }[padding];

  return (
    <ThemedView
      style={[
        styles.card,
        {
          padding: paddingValue,
          borderRadius: radius.lg,
        },
        shadowStyle,
        style,
      ]}
      {...rest}
    >
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: lightModePalette.surface,
    borderWidth: 1,
    borderColor: lightModePalette.outline,
  },
});
