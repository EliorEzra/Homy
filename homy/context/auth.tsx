import { useNavigationContainerRef, useRouter, useSegments } from "expo-router";
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

  const useProtectedRoute = (user: Models.User<Models.Preferences> | null) => {
    const segments = useSegments();
    const router = useRouter();
    const [isNavigationReady, setNavigationReady] = useState(false);
    const rootNavigation = useNavigationContainerRef();

    useEffect(() => {
      const unsubscribe = rootNavigation?.addListener("state", () => {
        setNavigationReady(true);
      });
      return () => { if (unsubscribe) unsubscribe(); };
    }, [rootNavigation]);

    React.useEffect(() => {
      if (!isNavigationReady || !authInitialized) return;

      const inAuthGroup = segments[0] === "(auth)";
      const onVerifyScreen = segments[1] === "verify-email";

      if (!user && unverifiedUser && !onVerifyScreen) {
        router.push({
          pathname: "/verify-email",
          params: { userId: unverifiedUser.$id, email: unverifiedUser.email, password: "" },
        });
      } else if (!user && !unverifiedUser && !inAuthGroup) {
        router.push({ pathname: "/sign-in" });
      } else if (user && inAuthGroup) {
        router.push("/(tabs)/home");
      }
    }, [user, unverifiedUser, segments, authInitialized, isNavigationReady]);
  };

  useEffect(() => {
    (async () => {
      try {
        const fetchedUser = await account.get();
        console.log(fetchedUser);
        if (fetchedUser.emailVerification) {
          setAuth(fetchedUser);
        } else {
          console.log("Email not verified yet");
          setUnverifiedUser(fetchedUser);
          setAuth(null);
        }
      } catch (error) {
        console.log("error", error);
        setAuth(null);
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

  useProtectedRoute(user);

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
