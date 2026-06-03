import { useRef, useCallback } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * Wraps a tab screen with a fade-in animation each time the tab is focused.
 * The explicit backgroundColor prevents the white default from showing through
 * when opacity is near 0 during the animation.
 */
export function FadeScreen({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const backgroundColor = useThemeColor({}, 'background');

  useFocusEffect(
    useCallback(() => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return () => {
        opacity.setValue(0);
      };
    }, [])
  );

  return (
    <Animated.View style={[{ flex: 1, backgroundColor, opacity }, style]}>
      {children}
    </Animated.View>
  );
}
