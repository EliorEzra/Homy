import React, { useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models, ID } from "react-native-appwrite";

interface SignInResponse {
  data: Models.User<Models.Preferences> | undefined;
  error: Error | undefined;
}

interface SignUpResponse {
  data: { userId: string; email: string } | undefined;
  error: Error | undefined;
}

interface SignOutResponse {
  error: any | undefined;
  data: {} | undefined;
}

interface AuthContextValue {
  signIn: (e: string, p: string) => Promise<SignInResponse>;
  signUp: (e: string, p: string, n: string) => Promise<SignUpResponse>;
  verifyEmail: (userId: string, secret: string, email: string, password: string) => Promise<SignInResponse>;
  resendVerification: (userId: string, email: string) => Promise<{ error?: Error }>;
  signOut: () => Promise<SignOutResponse>;
  user: Models.User<Models.Preferences> | null;
  unverifiedUser: Models.User<Models.Preferences> | null;
  authInitialized: boolean;
}

interface ProviderProps {
  children: React.ReactNode;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider(props: ProviderProps) {
  const [user, setAuth] = React.useState<Models.User<Models.Preferences> | null>(null);
  const [unverifiedUser, setUnverifiedUser] = React.useState<Models.User<Models.Preferences> | null>(null);
  const [authInitialized, setAuthInitialized] = React.useState<boolean>(false);

  useEffect(() => {
    (async () => {
      // Retry up to 3 times with increasing delays to handle startup network blips
      // (common on self-hosted Appwrite with dynamic DNS like dynv6).
      let fetchedUser = null;
      const delays = [0, 1000, 2500];
      for (const delay of delays) {
        try {
          if (delay > 0) await new Promise(r => setTimeout(r, delay));
          fetchedUser = await account.get();
          break; // success
        } catch (error: any) {
          const isNetworkError = error?.message?.includes('Network request failed');
          if (!isNetworkError || delay === delays[delays.length - 1]) {
            // Non-network error, or all retries exhausted — give up
            setAuth(null);
            setAuthInitialized(true);
            return;
          }
          // Network error and retries remain — keep trying
        }
      }
      if (fetchedUser) {
        if (fetchedUser.emailVerification) {
          setAuth(fetchedUser);
        } else {
          setUnverifiedUser(fetchedUser);
          setAuth(null);
        }
      }
      setAuthInitialized(true);
    })();
  }, []);

  const logout = async (): Promise<SignOutResponse> => {
    try {
      const response = await account.deleteSession("current");
      return { error: undefined, data: response };
    } catch (error) {
      return { error, data: undefined };
    } finally {
      setAuth(null);
      setUnverifiedUser(null);
    }
  };

  const login = async (email: string, password: string): Promise<SignInResponse> => {
    try {
      // Appwrite rejects createEmailPasswordSession if a session already exists.
      // This can happen when a startup network blip causes account.get() to fail,
      // setting auth to null even though a valid session cookie is still present.
      // Silently deleting the current session first makes login always safe to call.
      try { await account.deleteSession('current'); } catch (_) {}
      await account.createEmailPasswordSession({ email, password });
      const fetchedUser = await account.get();
      if (fetchedUser.emailVerification) {
        setAuth(fetchedUser);
        setUnverifiedUser(null);
      } else {
        setAuth(null);
        setUnverifiedUser(fetchedUser);
      }
      return { data: fetchedUser, error: undefined };
    } catch (error) {
      setAuth(null);
      return { error: error as Error, data: undefined };
    }
  };

  const createAcount = async (email: string, password: string, username: string): Promise<SignUpResponse> => {
    try {
      const newUser = await account.create({ userId: ID.unique(), email, password, name: username });
      await account.createEmailToken({ userId: newUser.$id, email, phrase: false });
      return { data: { userId: newUser.$id, email }, error: undefined };
    } catch (error) {
      return { error: error as Error, data: undefined };
    }
  };

  const resendVerification = async (userId: string, email: string): Promise<{ error?: Error }> => {
    try {
      await account.createEmailToken({ userId, email, phrase: false });
      return {};
    } catch (error) {
      return { error: error as Error };
    }
  };

  const verifyEmail = async (userId: string, secret: string, email: string, password: string): Promise<SignInResponse> => {
    try {
      try { await account.deleteSession("current"); } catch (e) {}
      await account.createSession(userId, secret.trim());
      const updatedUser = await account.get();
      setAuth(updatedUser);
      setUnverifiedUser(null);
      return { data: updatedUser, error: undefined };
    } catch (error) {
      console.error("Verification failed:", error);
      setAuth(null);
      return { error: error as Error, data: undefined };
    }
  };

  return (
    <AuthContext.Provider value={{ signIn: login, signOut: logout, signUp: createAcount, verifyEmail, resendVerification, user, unverifiedUser, authInitialized }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) throw new Error("useAuth must be used within an AuthContextProvider");
  return authContext;
};
