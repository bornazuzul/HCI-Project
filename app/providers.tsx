"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useData, type AppUser } from "@/hooks/use-data";

export type UserRole = "user" | "admin" | null;

export interface AppContextType {
  isLoggedIn: boolean;
  user: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { users, addUser, initializeWithMockData } = useData();

  // Initialize app with mock data on first load
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const stored = localStorage.getItem("volunteerme_data");
      if (!stored) {
        initializeWithMockData();
      }
      setIsInitialized(true);
    }
  }, [initializeWithMockData, isInitialized]);

  const login = async (email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const foundUser = users.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      setIsLoggedIn(true);
      localStorage.setItem("currentUser", JSON.stringify(foundUser));
    } else {
      throw new Error("Invalid email or password");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const emailExists = users.some((u) => u.email === email);
    if (emailExists) {
      throw new Error("Email already exists");
    }

    const newUser = addUser({
      name,
      email,
      password,
      role: "user",
    });

    setUser(newUser);
    setIsLoggedIn(true);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem("currentUser");
  };

  // Restore user session on mount
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      const storedUser = localStorage.getItem("currentUser");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setIsLoggedIn(true);
        } catch (error) {
          console.error("Failed to restore user session:", error);
        }
      }
    }
  }, [isInitialized]);

  return (
    <AppContext.Provider value={{ isLoggedIn, user, login, register, logout }}>
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
