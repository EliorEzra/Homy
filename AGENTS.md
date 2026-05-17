# Homy — AI Agent Instructions

## Project Overview

**Homy** is a multi-platform React Native app built with Expo for iOS, Android, and Web. It's a home management application with user authentication, a tabbed navigation system, and a custom theming layer.

**Tech Stack:**
- Expo 54.0 with React Native 0.81 and React 19.1
- TypeScript (strict mode)
- Expo Router for file-based routing
- Appwrite for backend authentication
- Custom theming system (light/dark mode)
- Emotion for styled components

**Key Features:**
- User authentication (sign-in, sign-up)
- Multi-tab navigation (home, tasks)
- Dark/light mode support
- Cross-platform UI with themed components

---

## Directory Structure & Conventions

```
homy/
├── app/                          # Expo Router routes (file-based routing)
│   ├── (auth)/                   # Auth routes: sign-in, sign-up
│   ├── (tabs)/                   # Authenticated routes: home, tasks
│   ├── index.tsx                 # Root entry point
│   └── _layout.tsx               # Root layout (AuthProvider wrapper)
├── components/                   # Reusable UI components
│   ├── themed-*.tsx              # Themed variants (button, input, text, view)
│   └── ui/                       # Lower-level UI components
├── context/                      # React context providers
│   └── auth.tsx                  # Authentication context & AuthProvider
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts       # Platform-specific color scheme detection
│   ├── use-color-scheme.web.ts   # Web-specific override
│   └── use-theme-color.ts        # Theme color resolver
├── lib/                          # Backend & utility libraries
│   └── appwrite.ts               # Appwrite client initialization
├── theme/                        # Design system
│   ├── palette.ts                # Color definitions (light/dark)
│   ├── typography.ts             # Font sizes, weights, line heights
│   ├── spacing.ts                # Spacing scale
│   └── theme.ts                  # Theme aggregation & Colors export
└── assets/                       # Images, icons, fonts
```

---

## Authentication Flow

The **AuthProvider** wraps the entire app at the root layout (`app/_layout.tsx`). Key behaviors:

### Session Management
- `auth.tsx` manages user state and auto-initializes on app load
- User session is checked via `account.get()` on mount
- Route protection is automatic: unauthenticated users are redirected to `/sign-in`

### Key Functions
- `signIn(email, password)` — Creates session + returns user
- `signUp(email, password, username)` — Creates account + session
- `signOut()` — Clears session
- `useAuth()` hook — Access auth context anywhere in the app

### Protected Routes
- Auth group routes: `/(auth)/sign-in`, `/(auth)/sign-up` (only for unauthenticated users)
- Tab routes: `/(tabs)/home`, `/(tabs)/tasks` (only for authenticated users)
- Navigation is automatic; don't manually check auth in route components

---

## Theming & Styling

### Color System
- **Light mode**: Defined in `theme/palette.ts` → `lightModePalette`
- **Dark mode**: Defined in `theme/palette.ts` → `darkModePalette`
- Colors are exported as `Colors.light` and `Colors.dark` from `theme.ts`
- Use `useThemeColor()` hook to get the correct color for the current theme

### Typography
- Exported from `theme/typography.ts` as a scale object
- Usage: `typography.body.md`, `typography.heading.lg`, etc.
- Applied via `StyleSheet` styles

### Spacing
- Exported from `theme/spacing.ts` (e.g., `spacing.sm`, `spacing.md`, `spacing.lg`)
- Use for consistent padding/margin across the app

### Creating Themed Components
1. Import `useThemeColor` from `@/hooks/use-theme-color`
2. Import `spacing`, `typography` from `@/theme/theme`
3. Use the hook to resolve colors, then apply to styles
4. Example: See `components/themed-button.tsx`

---

## Navigation

**Expo Router** handles routing via file-based structure:

- Routes are defined by file paths in the `app/` directory
- `_layout.tsx` files define layout/nesting
- Route groups (folders wrapped in parentheses, e.g., `(auth)`) don't appear in the URL
- Typed route paths are enabled (`typedRoutes: true` in `app.json`)

### Example Routes
- `/` → `app/index.tsx`
- `/sign-in` → `app/(auth)/sign-in.tsx`
- `/sign-up` → `app/(auth)/sign-up.tsx`
- `/(tabs)/home` → `app/(tabs)/home.tsx`
- `/(tabs)/tasks` → `app/(tabs)/tasks.tsx`

Use `useRouter()` to programmatically navigate (e.g., `router.push("/(tabs)/home")`).

---

## Component Patterns

### Themed Components
All UI components should use the theming system:
- Accept optional `lightColor` and `darkColor` props
- Use `useThemeColor()` to resolve the actual color
- Export a descriptive `Props` type

### Example: ThemedButton
```tsx
export type ButtonProps = PressableProps & {
  title: string;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  lightColor?: string;
  darkColor?: string;
}

export function ThemedButton({ title, size = "md", disabled, lightColor, darkColor, ...props }: ButtonProps) {
  const bgColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    disabled ? 'disabledButtonBackground' : 'buttonBackground'
  );
  // ... rest of implementation
}
```

### Naming Convention
- Prefix with `Themed` for theme-aware components (e.g., `ThemedButton`, `ThemedInput`)
- UI components in `components/ui/` are lower-level primitives

---

## Backend Integration (Appwrite)

Configuration is in `lib/appwrite.ts`:
- Endpoint, Project ID, and Platform are loaded from `.env` (Expo public env vars)
- Only the `account` object is exported for now
- To add more services (databases, storage), import additional Appwrite classes

### Working with Account
```tsx
import { account } from '@/lib/appwrite';

const user = await account.get();
await account.createEmailPasswordSession({ email, password });
await account.deleteSession('current');
```

---

## Development Workflow

### Start the App
```bash
npm start         # Start dev server
npm run ios       # Run on iOS simulator
npm run android   # Run on Android emulator
npm run web       # Run on web browser
```

### Linting
```bash
npm run lint
```

### Environment Setup
- Create a `.env` file in `homy/` with Appwrite credentials
- See `.env` file for required variables: `EXPO_PUBLIC_APPWRITE_ENDPOINT`, `EXPO_PUBLIC_APPWRITE_PROJECT_ID`, `EXPO_PUBLIC_APPWRITE_PLATFORM_NAME`

### Important Notes
- TypeScript strict mode is enabled; all types must be properly declared
- React Compiler is enabled (`reactCompiler: true` in `app.json`)
- New Architecture is enabled (`newArchEnabled: true`)

---

## Code Style & Best Practices

1. **File organization**: Place related files in their directories (components in `components/`, hooks in `hooks/`, etc.)
2. **Type safety**: Always export component `Props` types explicitly
3. **Theme colors**: Never hardcode colors; use `useThemeColor()` hook
4. **Component exports**: Use named exports for components; this helps with tooling
5. **Routing**: Use Expo Router's `useRouter()` and `useRoute()` for navigation
6. **Error handling**: Wrap async auth operations in try-catch; return typed response objects

---

## Useful Hooks & Utilities

| Hook/Utility | Purpose |
|---|---|
| `useAuth()` | Access auth context (user, signIn, signOut, signUp) |
| `useThemeColor()` | Resolve theme color based on light/dark mode |
| `useColorScheme()` | Get current color scheme ("light" or "dark") |
| `useRouter()` | Navigate programmatically |
| `useRoute()` | Access current route params |

---

## Common Tasks

### Add a New Authenticated Page
1. Create file in `app/(tabs)/` directory (e.g., `app/(tabs)/settings.tsx`)
2. Import and use `useAuth()` to access current user
3. Use themed components for UI consistency
4. Add navigation link in tab layout

### Add a New Themed Component
**Quick Method** (Recommended):
```bash
node scripts/create-component.js Card
```
This generates a boilerplate component in `components/themed-card.tsx`.

**Manual Method**:
1. Create file in `components/` (e.g., `components/themed-card.tsx`)
2. Import `useThemeColor`, `spacing`, `typography` from theme
3. Accept optional `lightColor`/`darkColor` props
4. Use `useThemeColor()` to resolve colors
5. Export a `Props` type

See `.claude/skills/create-component.md` for detailed templates and patterns.

### Change Theme Colors
1. Edit `theme/palette.ts` for light/dark palettes
2. Update `Colors` object in `theme/theme.ts` if adding new color slots
3. Use `useThemeColor()` with the correct color key when creating components

### Working with Appwrite
See `.claude/skills/appwrite-integration.md` for:
- Authentication patterns (login, signup, logout)
- Database operations (CRUD)
- Storage integration
- Error handling
- Common tasks (password reset, OAuth, sessions)

---

## Useful Resources

| Resource | Purpose |
|---|---|
| `.claude/skills/create-component.md` | Detailed guide for creating themed components with templates |
| `.claude/skills/appwrite-integration.md` | Appwrite patterns and best practices |
| `scripts/create-component.js` | CLI tool to scaffold new components |
| `scripts/README.md` | Scripts documentation |

---

## Debugging

- Check `.env` for missing/invalid Appwrite credentials (auth failures are often due to this)
- Use `console.log()` in auth context; logs print during initialization
- For platform-specific issues, check the `.web.ts` variants (e.g., `use-color-scheme.web.ts`)
- React Compiler and New Architecture can cause unexpected behavior; test on actual devices/simulators
- For Appwrite errors, see the error handling section in `.claude/skills/appwrite-integration.md`
