"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

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
  const supabase = createClient();

  // Function to refresh auth state
  const refreshAuth = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as "user" | "admin",
          });
          setIsLoggedIn(true);
        }
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error("Error refreshing auth:", error);
      setUser(null);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    console.log("🔍 AppProvider mounting, checking session...");
    refreshAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    console.log("🔍 Setting up auth state listener...");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event, "Has session:", !!session);

      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ User signed in:", session.user.email);

        // Get user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profile) {
          console.log("✅ Profile loaded:", profile.email);
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            role: profile.role as "user" | "admin",
          });
          setIsLoggedIn(true);

          // Force a small delay before redirect to ensure state is updated
          setTimeout(() => {
            console.log("🔄 Redirecting after sign in...");
            router.push("/");
            router.refresh();
          }, 300);
        }
      } else if (event === "SIGNED_OUT") {
        console.log("ℹ️ User signed out");
        setUser(null);
        setIsLoggedIn(false);
        router.push("/login");
        router.refresh();
      } else if (event === "TOKEN_REFRESHED") {
        console.log("ℹ️ Token refreshed");
        // Refresh auth state
        await refreshAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, [router, supabase.auth]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("🔐 Attempting login for:", email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        console.error("❌ Login error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("✅ Login successful, user ID:", data.user?.id);

      // Return success - the onAuthStateChange listener will handle the rest
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

      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          data: {
            name: name.trim(),
          },
        },
      });

      if (authError) {
        console.error("❌ Supabase auth error:", authError.message);
        return { success: false, error: authError.message };
      }

      if (authData.user) {
        console.log("✅ Auth user created, ID:", authData.user.id);

        // 2. Create profile in database
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          email: email.trim(),
          name: name.trim(),
          role: "user",
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("❌ Profile creation error:", profileError.message);

          // If profile creation fails, try to delete the auth user
          try {
            await supabase.auth.admin.deleteUser(authData.user.id);
          } catch (deleteError) {
            console.error("Failed to delete auth user:", deleteError);
          }

          return {
            success: false,
            error: "Failed to create user profile. Please try again.",
          };
        }

        console.log("✅ Profile created successfully");

        // 3. Auto-login after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          console.error("❌ Auto-login failed:", signInError.message);
          return {
            success: false,
            error:
              "Registration successful but auto-login failed. Please log in manually.",
          };
        }

        console.log("✅ Registration and auto-login completed!");
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
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
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(error.message);

      setUser(null);
      setIsLoggedIn(false);
      router.push("/login");
      router.refresh();
    } catch (error: any) {
      throw new Error(error.message || "Logout failed");
    } finally {
      setIsLoading(false);
    }
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
