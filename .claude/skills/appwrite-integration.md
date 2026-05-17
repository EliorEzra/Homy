# Appwrite Integration Skill

## Overview
This skill provides patterns, utilities, and best practices for integrating Appwrite services in the Homy app. It covers authentication, database operations, error handling, and common patterns.

---

## Current Setup

### Client Configuration
Located in `lib/appwrite.ts`:
```tsx
import { Client, Account } from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM_NAME as string);

export const account = new Account(client);
```

### Environment Variables Required
```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_PLATFORM_NAME=your-platform-name
```

---

## Authentication Patterns

### 1. User Login
```tsx
import { account } from '@/lib/appwrite';

const login = async (email: string, password: string) => {
  try {
    // Create session
    const session = await account.createEmailPasswordSession({
      email,
      password,
    });
    // Fetch user details
    const user = await account.get();
    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};
```

### 2. User Registration
```tsx
import { ID } from "react-native-appwrite";

const signup = async (email: string, password: string, name: string) => {
  try {
    // Create user account
    await account.create({
      userId: ID.unique(),
      email,
      password,
      name,
    });
    // Automatically create session
    await account.createEmailPasswordSession({ email, password });
    // Fetch user
    const user = await account.get();
    return { success: true, user };
  } catch (error) {
    return { success: false, error };
  }
};
```

### 3. Check Session Status
```tsx
const getSession = async () => {
  try {
    const user = await account.get();
    return { authenticated: true, user };
  } catch (error) {
    return { authenticated: false, user: null };
  }
};
```

### 4. Logout
```tsx
const logout = async () => {
  try {
    await account.deleteSession('current');
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
```

---

## Common Error Handling

### Error Types
Appwrite throws `AppwriteException` with the following structure:
```tsx
{
  code: number,           // HTTP status code
  message: string,        // Error message
  type: string,           // Error type (e.g., "user_already_exists")
}
```

### Error Handler Pattern
```tsx
import { AppwriteException } from "react-native-appwrite";

const handleAppwriteError = (error: unknown) => {
  if (error instanceof AppwriteException) {
    switch (error.type) {
      case 'user_already_exists':
        return 'Email is already registered';
      case 'user_invalid_credentials':
        return 'Invalid email or password';
      case 'user_not_found':
        return 'User not found';
      case 'user_session_already_exists':
        return 'Session already exists';
      default:
        return error.message || 'An error occurred';
    }
  }
  return 'An unexpected error occurred';
};
```

---

## Extending Appwrite Services

### Adding Databases Service
```tsx
// lib/appwrite.ts
import { Client, Account, Databases } from "react-native-appwrite";

const client = new Client();
client
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT as string)
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID as string)
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM_NAME as string);

export const account = new Account(client);
export const databases = new Databases(client);
```

### Database Query Pattern
```tsx
import { databases } from '@/lib/appwrite';
import { Query } from "react-native-appwrite";

const fetchUserTasks = async (userId: string) => {
  try {
    const response = await databases.listDocuments(
      'DATABASE_ID',      // Your Appwrite database ID
      'COLLECTION_ID',    // Your collection ID
      [Query.equal('userId', userId)]
    );
    return { success: true, data: response.documents };
  } catch (error) {
    return { success: false, error };
  }
};
```

### Create Document
```tsx
import { ID } from "react-native-appwrite";

const createTask = async (userId: string, title: string, description: string) => {
  try {
    const doc = await databases.createDocument(
      'DATABASE_ID',
      'COLLECTION_ID',
      ID.unique(),
      {
        userId,
        title,
        description,
        createdAt: new Date().toISOString(),
      }
    );
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error };
  }
};
```

### Update Document
```tsx
const updateTask = async (docId: string, updates: Record<string, any>) => {
  try {
    const doc = await databases.updateDocument(
      'DATABASE_ID',
      'COLLECTION_ID',
      docId,
      updates
    );
    return { success: true, data: doc };
  } catch (error) {
    return { success: false, error };
  }
};
```

### Delete Document
```tsx
const deleteTask = async (docId: string) => {
  try {
    await databases.deleteDocument('DATABASE_ID', 'COLLECTION_ID', docId);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
```

---

## Storage Integration

### Adding Storage Service
```tsx
// lib/appwrite.ts
import { Storage } from "react-native-appwrite";

export const storage = new Storage(client);
```

### Upload File
```tsx
import { ID } from "react-native-appwrite";

const uploadFile = async (filePath: string, bucketId: string) => {
  try {
    const file = await storage.createFile(
      bucketId,
      ID.unique(),
      { uri: filePath }  // File URI from device
    );
    return { success: true, fileId: file.$id };
  } catch (error) {
    return { success: false, error };
  }
};
```

### Get File Preview
```tsx
const getFilePreview = (bucketId: string, fileId: string) => {
  return storage.getFilePreview(bucketId, fileId);
};
```

---

## Context Pattern for Auth

### Custom Hook with Typed Responses
```tsx
interface AuthResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export const useAppwrite = () => {
  const login = async (email: string, password: string): Promise<AuthResponse<Models.User>> => {
    try {
      const session = await account.createEmailPasswordSession({ email, password });
      const user = await account.get();
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: handleAppwriteError(error) };
    }
  };

  return { login, /* ... other methods ... */ };
};
```

---

## Best Practices

1. **Always use ID.unique()** for creating new documents (generates valid UUID)
2. **Wrap async calls in try-catch** — Appwrite always throws exceptions on errors
3. **Validate input** — Check email format, password strength before sending to Appwrite
4. **Cache user state** — Store user in context to avoid repeated `account.get()` calls
5. **Handle network errors** — Appwrite calls can fail due to network; provide user feedback
6. **Use TypeScript** — Import `Models` types from Appwrite for type safety
7. **Environment variables** — Never hardcode API keys; use `.env` with `EXPO_PUBLIC_` prefix
8. **Error messages** — Map error types to user-friendly messages
9. **Session management** — Always check session exists before making authenticated requests
10. **Test on device** — Simulator/emulator network conditions differ from production

---

## Common Tasks

### Task: Add Password Reset
1. Use `account.createPasswordRecovery(email, redirectUrl)`
2. Catch the recovery token from the URL
3. Call `account.updatePassword(newPassword, confirmPassword, userId, secret)`

### Task: Enable OAuth (Google/GitHub)
1. Configure OAuth in Appwrite console
2. Call `account.createOAuth2Session('google')` or `account.createOAuth2Session('github')`
3. Handle redirect in deep linking config

### Task: Store User Preferences
1. Use `account.updatePrefs(prefs)` to store metadata on the user
2. Access via `user.prefs` when logged in
3. Useful for storing theme preference, language, etc.

### Task: List User Sessions
1. Call `account.listSessions()` to see all active sessions
2. Call `account.deleteSession(sessionId)` to logout from specific device

---

## Debugging

- **401 Unauthorized**: Session expired or invalid; prompt user to re-login
- **403 Forbidden**: User doesn't have permission; check security rules in Appwrite console
- **400 Bad Request**: Invalid parameters; check types and field names match Appwrite schema
- **Network error**: Check `.env` variables and Appwrite instance is running
- **CORS issues**: Ensure platform name in `.env` matches Appwrite console settings
