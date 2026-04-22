import { ThemedText, ThemedTextProps } from './themed-text';

export function MonoText(props: ThemedTextProps) {
  return <ThemedText {...props} style={[props.style, { fontFamily: 'SpaceMono' }]} />;
}