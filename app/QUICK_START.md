# HOMY React Native - Quick Start Guide

## ✅ Conversion Complete!

Your HOMY app has been successfully converted from React to React Native with Expo! The app is now running and ready to use.

## 🚀 Getting Started

### Current Status
- **Expo Server**: Running on `exp://192.168.1.46:8081`
- **Project Location**: `c:\Users\netanel marchum\Desktop\HOMY\homy v1.2\app`
- **Status**: ✅ Development server active

### Running the App

#### On Android
1. Install **Expo Go** app from Google Play Store
2. Scan the QR code displayed in the terminal
3. The app will open automatically

#### On iOS
1. Install **Expo Go** app from Apple App Store
2. Open the Camera app
3. Scan the QR code displayed in the terminal
4. Tap the notification to open in Expo Go

#### On Web
Press **w** in the terminal to open the app in your web browser

#### In Android Emulator
Press **a** in the terminal to launch the Android emulator

### Available Commands in Terminal

While the development server is running:

| Key | Action |
|-----|--------|
| `a` | Open Android emulator |
| `w` | Open in web browser |
| `i` | Open iOS simulator |
| `r` | Reload the app |
| `m` | Toggle menu |
| `j` | Open debugger |
| `o` | Open code in editor |
| `s` | Switch to development build |
| `?` | Show all commands |
| `Ctrl+C` | Stop the server |

## 📁 Project Structure

```
app/
├── App.tsx                 # Main app component
├── index.js                # Entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── .env                    # Environment variables
│
├── components/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Logo.tsx
│   ├── TopBar.tsx
│   ├── BottomNav.tsx
│   └── Layout.tsx
│
├── screens/                # All app screens
│   ├── Welcome.tsx
│   ├── Home.tsx
│   ├── Tasks.tsx
│   ├── Finances.tsx
│   ├── Calendar.tsx
│   ├── ShoppingList.tsx
│   ├── Profile.tsx
│   ├── HomyAI.tsx
│   ├── FamilyTrip.tsx
│   ├── FamilyLiveStatus.tsx
│   ├── Notifications.tsx
│   ├── JoinFamily.tsx
│   ├── CreateAccount.tsx
│   ├── TaskDetail.tsx
│   └── NotificationSettings.tsx
│
├── design-system/
│   ├── colors.ts           # Color palette
│   ├── spacing.ts          # Spacing tokens
│   └── typography.ts       # Font styles
│
├── services/
│   └── socket.ts           # Socket.io client
│
└── node_modules/           # Dependencies
```

## 🎨 Design System

The app uses a consistent design system with:

### Colors
- **Primary**: #ff5c02 (Orange)
- **Secondary**: #4d00ff (Purple)
- **Neutral**: Multiple shades (100-1000)
- **Error**: #d00416 (Red)
- **Warning**: #dfb400 (Yellow)
- **Success**: #1fc16b (Green)

### Spacing
- xs: 4dp, sm: 8dp, md: 12dp, lg: 16dp, xl: 20dp
- 2xl: 24dp, 3xl: 32dp, 4xl: 40dp, 5xl: 48dp

### Typography
- Headings: 1, 2, 3 (sizes: 32px, 28px, 24px)
- Body: lg, md, sm (sizes: 18px, 16px, 14px)
- Labels: lg, md, sm (sizes: 16px, 14px, 12px)

## 🔧 Development

### Modifying Components

All components are in `app/components/` and use React Native elements:

```typescript
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "../design-system/colors";

export default function MyComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Hello World</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold" }
});
```

### Adding New Screens

1. Create a new file in `app/screens/`
2. Export a default component
3. Add a new view type to `ViewType` in `BottomNav.tsx`
4. Add the screen rendering logic in `App.tsx`

### Styling

Use `StyleSheet` for all styles:
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
});
```

## 🔌 Socket.io Integration

The app automatically connects to a Socket.io server at startup:

```typescript
// In any component
import { getSocket } from "../services/socket";

const socket = getSocket();
socket.on("notification", (data) => {
  // Handle notification
});
```

### Changing Socket.io URL

Edit `.env` file:
```
EXPO_PUBLIC_API_URL=http://your-server:port
```

## 📦 Dependencies

- **React Native**: 0.73.11 - Core framework
- **Expo**: ~51.0.0 - Mobile development platform
- **React Navigation**: Navigation UI components
- **Socket.io-client**: Real-time communication
- **@expo/vector-icons**: Icon library
- **TypeScript**: Type safety

## ⚙️ Configuration Files

### app.json
Expo configuration including:
- App name and slug
- Icons and splash screen
- Platform-specific settings

### tsconfig.json
TypeScript compiler options for React Native development

### .env
Environment variables:
- `EXPO_PUBLIC_API_URL` - Server URL for Socket.io

## 🐛 Troubleshooting

### Connection Issues
1. Ensure your device is on the same WiFi network
2. Check that the development server is running (look for `Metro waiting...`)
3. Verify the IP address in the terminal matches your network

### Hot Reload Not Working
Press `r` in the terminal to manually reload the app

### QR Code Not Scanning
- Make sure your camera is focused
- Try pressing `r` to regenerate the QR code
- Restart the development server

### Port Conflicts
If port 8081 is already in use, Expo will automatically use the next available port

## 📚 Navigation Flow

The app uses state-based navigation:

1. **Welcome** → Main entry point
2. **Join Family/Create Account** → Auth screens
3. **Home** → Dashboard (after auth)
4. **Bottom Tab Navigation** → 6 main screens:
   - Home
   - Tasks
   - Finances
   - Calendar
   - Shopping List
   - Profile

## 🎯 Next Steps

1. **Populate placeholder screens** - Add actual content to each screen
2. **Connect to backend** - Update Socket.io endpoints
3. **Add real data** - Replace mock data with API calls
4. **Customize design** - Adjust colors/spacing as needed
5. **Add more features** - Maps, notifications, etc.

## 📖 Useful Resources

- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Socket.io Client](https://socket.io/docs/v4/client-api/)

## ✨ Key Features Converted

✅ Design system (colors, spacing, typography)
✅ Component library (Button, Input, Card, etc.)
✅ Navigation (Bottom tabs + views)
✅ Socket.io integration
✅ Responsive layouts
✅ TypeScript support
✅ All screen scaffolding

## 🚀 Ready to Build!

Your app is now ready for development. Start building amazing features!

For questions or issues, check the terminal output or refer to the React Native documentation.
