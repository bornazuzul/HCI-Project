"use client";

import { useState, useEffect, useCallback } from "react";

// Type definitions
export interface AppUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "user" | "admin";
  joinDate: string;
  activitiesJoined: number;
  status: "active" | "inactive";
}

interface DataContextType {
  // Users
  users: AppUser[];
  addUser: (
    user: Omit<AppUser, "id" | "joinDate" | "activitiesJoined" | "status">
  ) => AppUser;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => AppUser | undefined;
}

// Initialize localStorage
const STORAGE_KEY = "volunteerme_data";

const defaultState = {
  users: [],
  activities: [],
  notifications: [],
};

export function useData(): DataContextType {
  const [data, setData] = useState(defaultState);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setData(JSON.parse(stored));
        } catch (error) {
          console.error("Failed to parse stored data:", error);
        }
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined" && isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }, [data, isInitialized]);

  const addUser = useCallback(
    (
      user: Omit<AppUser, "id" | "joinDate" | "activitiesJoined" | "status">
    ) => {
      const newUser: AppUser = {
        ...user,
        id: `user-${Date.now()}-${Math.random()}`,
        joinDate: new Date().toISOString().split("T")[0],
        activitiesJoined: 0,
        status: "active",
      };
      setData((prev) => ({ ...prev, users: [...prev.users, newUser] }));
      return newUser;
    },
    []
  );

  const deleteUser = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      users: prev.users.filter((u) => u.id !== id),
    }));
  }, []);

  const getUserById = useCallback(
    (id: string) => {
      return data.users.find((u) => u.id === id);
    },
    [data.users]
  );

  const initializeWithMockData = useCallback(() => {
    const mockUsers: AppUser[] = [
      {
        id: "admin-1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        joinDate: "2025-01-01",
        activitiesJoined: 0,
        status: "active",
      },
      {
        id: "user-1",
        name: "user user",
        email: "user@example.com",
        password: "user123",
        role: "user",
        joinDate: "2025-10-15",
        activitiesJoined: 3,
        status: "active",
      },
    ];

    setData({
      users: mockUsers,
    });
  }, []);

  const clearAllData = useCallback(() => {
    setData(defaultState);
  }, []);

  return {
    users: data.users,
    activities: data.activities,
    notifications: data.notifications,
    addUser,
    deleteUser,
    getUserById,
    initializeWithMockData,
    clearAllData,
  };
}
