import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from './card';
import { Caption, Subheading, Body } from './typography';
import { spacing } from '@/theme/spacing';
import { radius } from '@/theme/radius';
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
      <Card
        style={[
          styles.eventCard,
          highlighted && styles.highlighted,
        ]}
        padding="md"
        variant="elevated"
      >
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <View style={styles.content}>
          <Caption color={lightModePalette.onSurfaceVariant}>{time}</Caption>
          <Subheading color={lightModePalette.onSurface}>{title}</Subheading>
          <Body size="sm" color={lightModePalette.onSurfaceVariant}>{location}</Body>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.md,
    minWidth: 280,
  },
  highlighted: {
    borderWidth: 2,
    borderColor: lightModePalette.primary.DEFAULT,
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
});
