import { useNavigationContainerRef, useRouter, useSegments } from "expo-router";
import React, { useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models, ID } from "react-native-appwrite";

// Define the AuthContextValue interface
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
  signOut: () => Promise<SignOutResponse>;
  user: Models.User<Models.Preferences> | null;
  authInitialized: boolean;
}

// Define the Provider component
interface ProviderProps {
  children: React.ReactNode;
}

// Create the AuthContext
const AuthContext = React.createContext<AuthContextValue | undefined>(
  undefined
);

export function AuthProvider(props: ProviderProps) {
  const [user, setAuth] =
    React.useState<Models.User<Models.Preferences> | null>(null);
  const [authInitialized, setAuthInitialized] = React.useState<boolean>(false);

  // This hook will protect the route access based on user authentication.
  const useProtectedRoute = (user: Models.User<Models.Preferences> | null) => {
    const segments = useSegments();
    const router = useRouter();

    // checking that navigation is all good;
    const [isNavigationReady, setNavigationReady] = useState(false);
    const rootNavigation = useNavigationContainerRef();

    useEffect(() => {
      const unsubscribe = rootNavigation?.addListener("state", (event) => {
        setNavigationReady(true);
      });
      return function cleanup() {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }, [rootNavigation]);

    React.useEffect(() => {
      if (!isNavigationReady) {
        return;
      }

      const inAuthGroup = segments[0] === "(auth)";

      if (!authInitialized) return;

      if (
        // If the user is not signed in and the initial segment is not anything in the auth group.
        !user &&
        !inAuthGroup
      ) {
        // Redirect to the sign-in page.
        router.push({pathname: "/sign-in"});
      } else if (user && inAuthGroup) {
        // Redirect away from the sign-in page.
        router.push("/(tabs)/home");
      }
    }, [user, segments, authInitialized, isNavigationReady]);
  };

  useEffect(() => {
    (async () => {
      try {
        const user = await account.get();
        console.log(user);
        // Only set user as authenticated if email is verified
        if (user.emailVerification) {
          setAuth(user);
        } else {
          console.log("Email not verified yet");
          setAuth(null);
        }
      } catch (error) {
        console.log("error", error);
        setAuth(null);
      }

      setAuthInitialized(true);
      console.log("initialize ", user);
    })();
  }, []);

  /**
   *
   * @returns
   */
  const logout = async (): Promise<SignOutResponse> => {
    try {
      const response = await account.deleteSession("current");
      return { error: undefined, data: response };
    } catch (error) {
      return { error, data: undefined };
    } finally {
      setAuth(null);
    }
  };
  /**
   *
   * @param email
   * @param password
   * @returns
   */
  const login = async (
    email: string,
    password: string
  ): Promise<SignInResponse> => {
    try {
      console.log(email, password);
      const response = await account.createEmailPasswordSession({
            email: email, 
            password: password
        });

      const user = await account.get();
      setAuth(user);
      return { data: user, error: undefined };
    } catch (error) {
      setAuth(null);
      return { error: error as Error, data: undefined };
    }
  };

  /**
   * 
   * @param email 
   * @param password 
   * @param username 
   * @returns 
   */
  const createAcount = async (
    email: string,
    password: string,
    username: string
  ): Promise<SignUpResponse> => {
    try {
      console.log(email, password, username);

      // create the user
      const newUser = await account.create({
        userId: ID.unique(),
        email: email,
        password: password,
        name: username
      });

      // Create email verification token
      await account.createEmailToken({
        userId: newUser.$id,
        email: email,
        phrase: false
      });

      return { data: { userId: newUser.$id, email: email }, error: undefined };
    } catch (error) {
      return { error: error as Error, data: undefined };
    }
  };

  /**
   * Verify email with token sent to user
   * @param userId 
   * @param secret 
   * @param email
   * @param password
   * @returns 
   */
  const verifyEmail = async (
    userId: string,
    secret: string,
    email: string,  
    password: string  
  ): Promise<SignInResponse> => {
    try {
      try {
        await account.deleteSession("current");
      } catch (e) {
      }

      await account.createSession(userId, secret.trim());

      const updatedUser = await account.get();
      setAuth(updatedUser);
      
      return { data: updatedUser, error: undefined };
    } catch (error) {
      console.error("Verification failed:", error);
      setAuth(null);
      return { error: error as Error, data: undefined };
    }
  };
  useProtectedRoute(user);

  return (
    <AuthContext.Provider
      value={{
        signIn: login,
        signOut: logout,
        signUp: createAcount,
        verifyEmail: verifyEmail,
        user,
        authInitialized,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
}

// Define the useAuth hook
export const useAuth = () => {
  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("useAuth must be used within an AuthContextProvider");
  }

  return authContext;
};