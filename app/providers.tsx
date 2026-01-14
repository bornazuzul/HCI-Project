"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export interface AppUser {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

export interface AppContextType {
  isLoggedIn: boolean;
  user: AppUser | null;
  isLoading: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Use Better Auth's useSession hook for client-side state
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Sync Better Auth session with our local state
  useEffect(() => {
    if (sessionLoading) {
      setIsLoading(true);
      return;
    }

    console.log("🔄 Syncing Better Auth session:", session);

    if (session?.user) {
      const sessionUser = session.user;
      setUser({
        id: sessionUser.id,
        email: sessionUser.email || "",
        name: sessionUser.name || "User",
        role: (sessionUser.role as "user" | "admin") || "user",
      });
      setIsLoggedIn(true);
      console.log("✅ Client-side user set:", sessionUser.email);
    } else {
      setUser(null);
      setIsLoggedIn(false);
      console.log("ℹ️ No client-side session");
    }

    setIsLoading(false);
  }, [session, sessionLoading]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting login for:", email);

      const { data, error } = await authClient.signIn.email({
        email: email.trim(),
        password: password.trim(),
        fetchOptions: {
          onResponse: (response) => {
            console.log("Login response:", response);
          },
        },
      });

      if (error) {
        console.error("❌ Login error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("✅ Login successful:", data);

      // Wait for session to sync
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect
      router.push("/");
      router.refresh();

      return { success: true };
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);
      return {
        success: false,
        error: error.message || "Login failed. Please check your credentials.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("📝 Starting registration for:", email);

      const { data, error } = await authClient.signUp.email({
        email: email.trim(),
        password: password.trim(),
        name: name.trim(),
      });

      if (error) {
        console.error("❌ Registration error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("✅ Registration successful:", data);

      // Auto-login after registration
      const loginResult = await authClient.signIn.email({
        email: email.trim(),
        password: password.trim(),
      });

      if (loginResult.error) {
        return {
          success: false,
          error:
            "Registration successful but auto-login failed. Please log in manually.",
        };
      }

      console.log("✅ Registration and auto-login completed!");

      // Wait for session to sync
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Redirect
      router.push("/");
      router.refresh();

      return { success: true };
    } catch (error: any) {
      console.error("❌ Registration failed:", error.message);
      return {
        success: false,
        error: error.message || "Registration failed. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      console.log("🚪 Logging out...");

      // Clear local state first
      setUser(null);
      setIsLoggedIn(false);

      // Sign out from Better Auth
      const { error } = await authClient.signOut();
      if (error) throw new Error(error.message);

      console.log("✅ Logout successful");

      // Force complete refresh and redirect
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      console.error("❌ Logout error:", error.message);
      // Still clear local state and redirect
      setUser(null);
      setIsLoggedIn(false);
      router.push("/login");
      router.refresh();
      throw new Error(error.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Keep refreshAuth for compatibility
  const refreshAuth = async () => {
    // Just trigger a re-fetch
    await authClient.getSession();
  };

  return (
    <AppContext.Provider
      value={{
        isLoggedIn,
        user,
        isLoading,
        login,
        register,
        logout,
        refreshAuth,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
