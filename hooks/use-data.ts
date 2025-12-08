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

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
  time: string;
  location: string;
  maxApplicants: number;
  status: "pending" | "approved" | "rejected";
  organizerId: string;
  organizerName: string;
  organizerEmail: string;
  applicants: string[]; // array of user IDs
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "announcement" | "activity-update" | "reminder";
  sender: string;
  senderRole: "admin" | "organizer";
  activityId?: string;
  activityTitle?: string;
  targetUsers: string[]; // array of user IDs or "all"
  timestamp: string;
  createdAt: string;
}

interface DataContextType {
  // Users
  users: AppUser[];
  addUser: (
    user: Omit<AppUser, "id" | "joinDate" | "activitiesJoined" | "status">
  ) => AppUser;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => AppUser | undefined;

  // Activities
  activities: Activity[];
  addActivity: (
    activity: Omit<Activity, "id" | "applicants" | "createdAt">
  ) => Activity;
  updateActivityStatus: (id: string, status: "approved" | "rejected") => void;
  deleteActivity: (id: string) => void;
  applyToActivity: (activityId: string, userId: string) => void;
  unapplyFromActivity: (activityId: string, userId: string) => void;
  getApprovedActivities: () => Activity[];
  getPendingActivities: () => Activity[];

  // Notifications
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "createdAt">
  ) => Notification;
  deleteNotification: (id: string) => void;
  getNotificationsForUser: (userId: string) => Notification[];

  // Utilities
  initializeWithMockData: () => void;
  clearAllData: () => void;
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

  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "applicants" | "createdAt">) => {
      const newActivity: Activity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random()}`,
        applicants: [],
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        activities: [...prev.activities, newActivity],
      }));
      return newActivity;
    },
    []
  );

  const updateActivityStatus = useCallback(
    (id: string, status: "approved" | "rejected") => {
      setData((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a.id === id ? { ...a, status } : a
        ),
      }));
    },
    []
  );

  const deleteActivity = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      activities: prev.activities.filter((a) => a.id !== id),
    }));
  }, []);

  const applyToActivity = useCallback((activityId: string, userId: string) => {
    setData((prev) => ({
      ...prev,
      activities: prev.activities.map((a) =>
        a.id === activityId && !a.applicants.includes(userId)
          ? { ...a, applicants: [...a.applicants, userId] }
          : a
      ),
    }));
  }, []);

  const unapplyFromActivity = useCallback(
    (activityId: string, userId: string) => {
      setData((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a.id === activityId
            ? { ...a, applicants: a.applicants.filter((id) => id !== userId) }
            : a
        ),
      }));
    },
    []
  );

  const getApprovedActivities = useCallback(() => {
    return data.activities.filter((a) => a.status === "approved");
  }, [data.activities]);

  const getPendingActivities = useCallback(() => {
    return data.activities.filter((a) => a.status === "pending");
  }, [data.activities]);

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random()}`,
        createdAt: new Date().toISOString(),
      };
      setData((prev) => ({
        ...prev,
        notifications: [...prev.notifications, newNotification],
      }));
      return newNotification;
    },
    []
  );

  const deleteNotification = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      notifications: prev.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const getNotificationsForUser = useCallback(
    (userId: string) => {
      return data.notifications.filter(
        (n) => n.targetUsers.includes("all") || n.targetUsers.includes(userId)
      );
    },
    [data.notifications]
  );

  const initializeWithMockData = useCallback(() => {
    const mockUsers: AppUser[] = [
      {
        id: "admin-1",
        name: "Admin User",
        email: "admin@example.com",
        password: "admin123",
        role: "admin",
        joinDate: "2024-01-01",
        activitiesJoined: 0,
        status: "active",
      },
      {
        id: "user-1",
        name: "John Smith",
        email: "john@example.com",
        password: "user123",
        role: "user",
        joinDate: "2024-10-15",
        activitiesJoined: 3,
        status: "active",
      },
    ];

    const mockActivities: Activity[] = [
      {
        id: "activity-1",
        title: "Beach Cleanup Drive",
        description: "Help us clean and protect our beautiful beaches.",
        category: "environment",
        image: "/beach-cleanup.jpg",
        date: "2024-12-15",
        time: "09:00 AM",
        location: "Santa Monica Beach, CA",
        maxApplicants: 50,
        status: "approved",
        organizerId: "user-1",
        organizerName: "John Smith",
        organizerEmail: "john@example.com",
        applicants: [],
        createdAt: new Date().toISOString(),
      },
    ];

    setData({
      users: mockUsers,
      activities: mockActivities,
      notifications: [],
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
    addActivity,
    updateActivityStatus,
    deleteActivity,
    applyToActivity,
    unapplyFromActivity,
    getApprovedActivities,
    getPendingActivities,
    addNotification,
    deleteNotification,
    getNotificationsForUser,
    initializeWithMockData,
    clearAllData,
  };
}
