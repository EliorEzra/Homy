#!/usr/bin/env node

/**
 * Component Scaffolding Script
 *
 * Usage: node scripts/create-component.js <ComponentName> [--interactive]
 * Example: node scripts/create-component.js Card
 *          node scripts/create-component.js ThemedCard
 *          node scripts/create-component.js CustomButton --interactive
 */

const fs = require('fs');
const path = require('path');

// Helper function to convert string to correct format
function toPascalCase(str) {
  return str
    .split(/[-_]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
}

function toKebabCase(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Get component name from args
const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: node scripts/create-component.js <ComponentName>');
  console.error('Example: node scripts/create-component.js Card');
  process.exit(1);
}

const componentNameInput = args[0];
const componentName = toPascalCase(componentNameInput);
const fileName = `themed-${toKebabCase(componentName)}`;
const componentPath = path.join(__dirname, '..', 'homy', 'components', `${fileName}.tsx`);

// Check if component already exists
if (fs.existsSync(componentPath)) {
  console.error(`Error: Component ${componentPath} already exists!`);
  process.exit(1);
}

// Component template
const componentTemplate = `import React from "react";
import {
  View,
  ViewProps,
  StyleSheet,
  type StyleProp,
  type ViewStyle
} from "react-native";
import { spacing } from '@/theme/theme';
import { useThemeColor } from "@/hooks/use-theme-color";

export type Themed${componentName}Props = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Themed${componentName}
 *
 * A themed component that adapts to light/dark mode.
 * Accepts optional lightColor/darkColor props for customization.
 */
export function Themed${componentName}({
  style,
  lightColor,
  darkColor,
  children,
  ...rest
}: Themed${componentName}Props) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    'background'
  );

  return (
    <View
      style={[
        styles.container,
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
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
  },
});
`;

// Create the component file
try {
  fs.writeFileSync(componentPath, componentTemplate, 'utf-8');
  console.log(`✅ Created component: ${componentPath}`);
  console.log(`\n📝 Component name: Themed${componentName}`);
  console.log(`📦 Import: import { Themed${componentName} } from '@/components/${fileName}';`);
  console.log(`\n📖 Next steps:`);
  console.log(`   1. Edit ${path.basename(componentPath)} to customize the component`);
  console.log(`   2. Add props as needed (size, variant, disabled, etc.)`);
  console.log(`   3. Use useThemeColor() hook to apply theme colors`);
  console.log(`   4. Update styles in StyleSheet.create() for visual appearance`);
  console.log(`   5. Test on iOS, Android, and Web platforms`);
} catch (error) {
  console.error(`Error creating component: ${error.message}`);
  process.exit(1);
}
