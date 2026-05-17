# Scripts Directory

This directory contains utility scripts for development.

## create-component.js

Scaffolds a new themed component with the correct structure, imports, and conventions.

### Usage
```bash
node scripts/create-component.js <ComponentName>
```

### Examples
```bash
# Creates: components/themed-card.tsx
node scripts/create-component.js Card

# Creates: components/themed-custom-button.tsx
node scripts/create-component.js CustomButton

# Creates: components/themed-badge.tsx
node scripts/create-component.js Badge
```

### What It Creates
- A new themed component file in `components/` directory
- Proper imports and TypeScript types
- Light/dark mode support via `useThemeColor()`
- StyleSheet with reasonable defaults
- Ready to customize with additional props and styles

### Next Steps After Running
1. Edit the generated file to add component-specific props
2. Customize styles in `StyleSheet.create()`
3. Add more logic and event handlers as needed
4. Test on iOS, Android, and Web platforms
