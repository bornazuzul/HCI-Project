// app/providers.tsx - REVERT TO WORKING VERSION
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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        console.log("🔍 Checking Supabase session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session check error:", error);
          return;
        }

        if (session?.user) {
          console.log("✅ Session found, user ID:", session.user.id);
          // Get user profile from database
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error("Profile fetch error:", profileError);
          } else if (profile) {
            console.log("✅ Profile loaded:", profile.email);
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              role: profile.role as "user" | "admin",
            });
            setIsLoggedIn(true);
          }
        } else {
          console.log("ℹ️ No active session found");
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 Auth state changed:", event);

      if (session?.user) {
        console.log("✅ User authenticated:", session.user.id);
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
        console.log("ℹ️ User logged out");
        setUser(null);
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

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
        throw new Error(error.message);
      }

      console.log("✅ Login successful, user ID:", data.user?.id);

      // Don't fetch profile here - let onAuthStateChange handle it
      // This prevents race conditions
    } catch (error: any) {
      console.error("❌ Login failed:", error.message);
      throw new Error(
        error.message || "Login failed. Please check your credentials."
      );
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

      console.log("Supabase auth response:", authData, authError);

      if (authError) {
        console.error("❌ Supabase auth error:", authError.message);
        throw new Error(authError.message);
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

          throw new Error("Failed to create user profile. Please try again.");
        }

        console.log("✅ Profile created successfully");

        // 3. Auto-login after registration
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });

        if (signInError) {
          console.error("❌ Auto-login failed:", signInError.message);
          throw signInError;
        }

        console.log("✅ Registration and auto-login completed!");
      }
    } catch (error: any) {
      console.error("❌ Registration failed:", error.message);
      throw new Error(
        error.message || "Registration failed. Please try again."
      );
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
