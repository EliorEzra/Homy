import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { radius } from '@/theme/radius';
import { spacing } from '@/theme/spacing';
import { lightModePalette } from '@/theme/palette';
import { LucideIcon } from 'lucide-react-native';

interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  backgroundColor?: string;
  iconColor?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function IconButton({
  icon: Icon,
  onPress,
  backgroundColor = lightModePalette.primary.DEFAULT,
  iconColor = lightModePalette.neutral[100],
  size = 'md',
  disabled = false,
}: IconButtonProps) {
  const sizeMap = {
    sm: 32,
    md: 44,
    lg: 56,
  };

  const iconSizeMap = {
    sm: 16,
    md: 24,
    lg: 28,
  };

  const buttonSize = sizeMap[size];
  const iconSize = iconSizeMap[size];

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          backgroundColor: disabled
            ? lightModePalette.neutral[300]
            : backgroundColor,
          borderRadius: radius.md,
        },
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon
        size={iconSize}
        color={iconColor}
        strokeWidth={2}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
