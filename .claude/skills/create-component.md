# Component Creation Hook

## Overview
This hook/skill guides the creation of new themed components in the Homy app. It ensures consistency, proper theming integration, and adherence to project conventions.

---

## Component Anatomy

Every themed component should follow this structure:

```
components/
├── themed-[name].tsx          # Main component file
├── themed-[name].styles.ts    # (Optional) Separated styles
└── index.ts                   # Export for easy imports
```

---

## Template: Basic Themed Component

### File: `components/themed-[component-name].tsx`

```tsx
import React from "react";
import { 
  View, 
  ViewProps, 
  StyleSheet, 
  type StyleProp, 
  type ViewStyle 
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

// Define component props
export type Themed[ComponentName]Props = ViewProps & {
  // Add component-specific props here
  variant?: "primary" | "secondary"; // Example
  size?: "sm" | "md" | "lg";         // Example
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Themed[ComponentName]
 * 
 * A themed component that adapts to light/dark mode.
 * Accepts optional lightColor/darkColor props for customization.
 */
export function Themed[ComponentName]({
  variant = "primary",
  size = "md",
  style,
  lightColor,
  darkColor,
  children,
  ...rest
}: Themed[ComponentName]Props) {
  // Resolve theme color
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'  // Use appropriate color key from Colors
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          paddingVertical: size === "sm" ? spacing.sm : size === "lg" ? spacing.lg : spacing.md,
          paddingHorizontal: spacing.md,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  },
});
```

---

## Template: Interactive Component (Pressable)

For buttons, cards, or other interactive elements:

```tsx
import React from "react";
import { 
  Pressable, 
  Text, 
  StyleSheet, 
  type PressableProps,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { spacing, typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type Themed[ComponentName]Props = PressableProps & {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
  textStyle?: TextStyle;
  style?: StyleProp<ViewStyle>;
}

export function Themed[ComponentName]({
  title,
  onPress,
  disabled = false,
  lightColor,
  darkColor,
  textStyle,
  style,
  ...rest
}: Themed[ComponentName]Props) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    disabled ? 'disabledButtonBackground' : 'buttonBackground'
  );

  const textColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    disabled ? 'disabledButtonTextColor' : 'buttonTextColor'
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.container,
        { backgroundColor },
        style,
      ]}
      {...rest}
    >
      {title && (
        <Text style={[typography.body.md, { color: textColor }, textStyle]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
});
```

---

## Template: Text Component

For typography variants:

```tsx
import React from "react";
import { 
  Text, 
  TextProps, 
  type StyleProp, 
  type TextStyle 
} from "react-native";
import { typography } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type Themed[TextComponent]Props = TextProps & {
  variant?: "heading" | "body" | "caption";
  size?: "sm" | "md" | "lg";
  weight?: "regular" | "semibold" | "bold";
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<TextStyle>;
}

export function Themed[TextComponent]({
  variant = "body",
  size = "md",
  weight = "regular",
  lightColor,
  darkColor,
  style,
  children,
  ...rest
}: Themed[TextComponent]Props) {
  const color = useThemeColor(
    { light: lightColor, dark: darkColor },
    'text'
  );

  // Build typography style based on variant and size
  const typographyStyle = typography[variant]?.[size] || typography.body.md;

  return (
    <Text
      style={[
        typographyStyle,
        { color },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}
```

---

## Step-by-Step Creation Process

### 1. Plan the Component
- Decide on component purpose and props
- Identify which colors/spacing it needs
- Plan for light/dark mode variants

### 2. Create the File
```bash
# Create file in components/
# Name: themed-[component-name].tsx
```

### 3. Import Dependencies
```tsx
import { useThemeColor } from "@/hooks/use-theme-color";
import { spacing, typography } from '@/theme/theme';
```

### 4. Define Props Type
```tsx
export type Themed[ComponentName]Props = [BaseProps] & {
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
  // ... other props
}
```

### 5. Implement Component
- Use `useThemeColor()` to resolve theme colors
- Use `spacing` for consistent padding/margins
- Use `typography` for consistent text styles
- Apply StyleSheet for static styles

### 6. Export Component
```tsx
export function Themed[ComponentName](props: Themed[ComponentName]Props) {
  // ... implementation
}
```

### 7. (Optional) Add to Components Index
If creating an index file:
```tsx
// components/index.ts
export { ThemedButton } from './themed-button';
export { ThemedInput } from './themed-input';
export { ThemedCard } from './themed-card';
```

---

## Color Keys Available

Use these keys with `useThemeColor()`:

| Key | Purpose |
|---|---|
| `text` | Primary text color |
| `background` | Background surface |
| `icon` | Icon color |
| `tabIconDefault` | Default tab icon |
| `inputBorderSelected` | Selected input border |
| `inputBorder` | Default input border |
| `inputBackground` | Input background |
| `buttonBackground` | Button background |
| `buttonTextColor` | Button text |
| `disabledButtonBackground` | Disabled button background |
| `disabledButtonTextColor` | Disabled button text |

To add new colors:
1. Add to `lightModePalette` and `darkModePalette` in `theme/palette.ts`
2. Add color key to `Colors` object in `theme/theme.ts`
3. Use `useThemeColor()` with the new key

---

## Common Component Patterns

### Pattern: Card Component
```tsx
export function ThemedCard({ children, style, lightColor, darkColor, ...rest }: Props) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
```

### Pattern: Input Component
```tsx
export function ThemedInput({ 
  placeholder, 
  value, 
  onChangeText,
  lightColor,
  darkColor,
  ...rest 
}: Props) {
  const borderColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'inputBorder'
  );

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'inputBackground'
  );

  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      style={[
        styles.input,
        { borderColor, backgroundColor },
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    fontSize: typography.body.md.fontSize,
  },
});
```

### Pattern: Badge/Label Component
```tsx
export function ThemedBadge({ label, variant = "primary", style, ...rest }: Props) {
  const backgroundColor = useThemeColor(
    { light: undefined, dark: undefined },
    variant === "primary" ? 'buttonBackground' : 'icon'
  );

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor },
        style,
      ]}
      {...rest}
    >
      <Text style={[typography.body.sm, styles.text]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignSelf: 'flex-start',
  },
  text: {
    color: 'white',
  },
});
```

---

## Testing Your Component

### Manual Testing Checklist
- [ ] Component renders without errors
- [ ] Light mode colors display correctly
- [ ] Dark mode colors display correctly
- [ ] Optional props work (size, variant, disabled)
- [ ] Custom styles can override defaults
- [ ] Text/content displays properly
- [ ] Platform-specific behavior (iOS vs Android vs Web)

### Example Test Screen
Create a temporary test page to verify:
```tsx
// app/test-components.tsx
import { ThemedCard } from '@/components/themed-card';
import { ThemedButton } from '@/components/themed-button';

export default function TestComponents() {
  return (
    <ScrollView>
      <ThemedCard>
        <Text>This is a card</Text>
      </ThemedCard>
      
      <ThemedButton
        title="Click me"
        onPress={() => console.log('pressed')}
      />
    </ScrollView>
  );
}
```

---

## Naming Conventions

- Prefix all themed components with `Themed` (e.g., `ThemedButton`, `ThemedCard`)
- Use PascalCase for component names
- Use camelCase for prop names
- Props type: `Themed[ComponentName]Props`
- Export types explicitly

---

## Performance Tips

1. **Memoize if needed**: Use `React.memo()` for components that receive frequent prop updates
2. **Avoid inline styles**: Use `StyleSheet.create()` for better performance
3. **Use `useCallback`** for event handlers passed to child components
4. **Platform-specific code**: Use `.ios.ts`, `.android.ts`, `.web.ts` for platform variants if needed

---

## Troubleshooting

**Component doesn't respond to theme changes:**
- Ensure `useThemeColor()` is called from within the component
- Check that the color key exists in `Colors` object

**Styles not applying:**
- Verify `StyleSheet.create()` is used for static styles
- Check style prop precedence: later styles override earlier ones

**Type errors:**
- Ensure component props type extends the base component's props
- Export types explicitly

**Platform issues:**
- Test on actual iOS, Android, and Web platforms
- Use platform-specific files (`.ios.ts`, `.android.ts`, `.web.ts`) if needed
