import { Text, StyleSheet, TextProps } from 'react-native';
import { typography } from '@/theme/typography';
import { lightModePalette } from '@/theme/palette';

// Heading component
export function Heading({
  level = 1,
  color = lightModePalette.onSurface,
  children,
  style,
  ...props
}: TextProps & {
  level?: 1 | 2 | 3;
  color?: string;
}) {
  const headingStyle = typography.heading[level];
  return (
    <Text
      style={[
        headingStyle,
        { color },
        styles.heading,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Subheading component
export function Subheading({
  color = lightModePalette.onSurfaceVariant,
  children,
  style,
  ...props
}: TextProps & {
  color?: string;
}) {
  return (
    <Text
      style={[
        typography.label.lg,
        { color },
        styles.subheading,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Body component
export function Body({
  size = 'md',
  color = lightModePalette.onSurface,
  children,
  style,
  ...props
}: TextProps & {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}) {
  const bodyStyle = typography.body[size];
  return (
    <Text
      style={[
        bodyStyle,
        { color },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

// Caption component
export function Caption({
  color = lightModePalette.onSurfaceVariant,
  children,
  style,
  ...props
}: TextProps & {
  color?: string;
}) {
  return (
    <Text
      style={[
        typography.label.sm,
        { color },
        styles.caption,
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontWeight: '700',
  },
  subheading: {
    fontWeight: '600',
  },
  caption: {
    fontWeight: '500',
  },
});
