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

  // Activities (localStorage)
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

  // Database activities (new - for admin panel)
  dbActivities: {
    pending: Activity[];
    approved: Activity[];
    rejected: Activity[];
    counts: { pending: number; approved: number; rejected: number };
    loading: boolean;
    refresh: () => Promise<void>;
    approveActivity: (activityId: string) => Promise<void>;
    rejectActivity: (activityId: string) => Promise<void>;
    deleteActivity: (activityId: string) => Promise<void>;
    createActivity: (
      activity: Omit<Activity, "id" | "applicants" | "createdAt" | "status">
    ) => Promise<Activity>;
  };

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

  // Database state (fetched via API)
  const [dbActivitiesState, setDbActivitiesState] = useState<{
    pending: Activity[];
    approved: Activity[];
    rejected: Activity[];
    counts: { pending: number; approved: number; rejected: number };
    loading: boolean;
  }>({
    pending: [],
    approved: [],
    rejected: [],
    counts: { pending: 0, approved: 0, rejected: 0 },
    loading: true,
  });

  // ========== LOCALSTORAGE FUNCTIONS ==========

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

  // ========== DATABASE FUNCTIONS (API Calls) ==========

  // Fetch activities from API
  const fetchActivitiesFromAPI = async (
    status: string
  ): Promise<Activity[]> => {
    try {
      const response = await fetch(`/api/activities?status=${status}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${status} activities`);
      }
      const data = await response.json();
      return data.activities || [];
    } catch (error) {
      console.error(`Error fetching ${status} activities:`, error);
      return [];
    }
  };

  // Load all database activities
  const loadDbActivities = useCallback(async () => {
    try {
      setDbActivitiesState((prev) => ({ ...prev, loading: true }));

      // Fetch all statuses in parallel
      const [pending, approved, rejected] = await Promise.all([
        fetchActivitiesFromAPI("pending"),
        fetchActivitiesFromAPI("approved"),
        fetchActivitiesFromAPI("rejected"),
      ]);

      // Map API response to Activity type
      const mapToActivity = (apiActivity: any): Activity => ({
        id: apiActivity.id || `db-${Date.now()}-${Math.random()}`,
        title: apiActivity.title || "Untitled",
        description: apiActivity.description || "",
        category: apiActivity.category || "community",
        image: apiActivity.image || "/placeholder.jpg",
        date: apiActivity.date || new Date().toISOString().split("T")[0],
        time: apiActivity.time || "10:00",
        location: apiActivity.location || "Unknown",
        maxApplicants: apiActivity.maxApplicants || 10,
        status: apiActivity.status || "pending",
        organizerId: apiActivity.organizerId || "unknown",
        organizerName: apiActivity.organizerName || "Unknown Organizer",
        organizerEmail: apiActivity.organizerEmail || "unknown@example.com",
        applicants: apiActivity.applicants || [],
        createdAt: apiActivity.createdAt || new Date().toISOString(),
      });

      setDbActivitiesState({
        pending: pending.map(mapToActivity),
        approved: approved.map(mapToActivity),
        rejected: rejected.map(mapToActivity),
        counts: {
          pending: pending.length,
          approved: approved.length,
          rejected: rejected.length,
        },
        loading: false,
      });
    } catch (error) {
      console.error("Error loading database activities:", error);
      setDbActivitiesState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Initial load of database activities
  useEffect(() => {
    if (isInitialized) {
      loadDbActivities();
    }
  }, [isInitialized, loadDbActivities]);

  // Database CRUD operations via API
  const dbApproveActivity = useCallback(
    async (activityId: string) => {
      try {
        const response = await fetch("/api/activities", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activityId, status: "approved" }),
        });

        if (!response.ok) throw new Error("Failed to approve activity");
        await loadDbActivities();
      } catch (error) {
        console.error("Error approving activity:", error);
        throw error;
      }
    },
    [loadDbActivities]
  );

  const dbRejectActivity = useCallback(
    async (activityId: string) => {
      try {
        const response = await fetch("/api/activities", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: activityId, status: "rejected" }),
        });

        if (!response.ok) throw new Error("Failed to reject activity");
        await loadDbActivities();
      } catch (error) {
        console.error("Error rejecting activity:", error);
        throw error;
      }
    },
    [loadDbActivities]
  );

  const dbDeleteActivity = useCallback(
    async (activityId: string) => {
      try {
        const response = await fetch(`/api/activities?id=${activityId}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete activity");
        await loadDbActivities();
      } catch (error) {
        console.error("Error deleting activity:", error);
        throw error;
      }
    },
    [loadDbActivities]
  );

  const dbCreateActivity = useCallback(
    async (
      activity: Omit<Activity, "id" | "applicants" | "createdAt" | "status">
    ) => {
      try {
        const response = await fetch("/api/activities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: activity.title,
            description: activity.description,
            category: activity.category,
            date: activity.date,
            time: activity.time,
            location: activity.location,
            maxApplicants: activity.maxApplicants,
            organizerId: activity.organizerId,
            organizerName: activity.organizerName,
            organizerEmail: activity.organizerEmail,
          }),
        });

        if (!response.ok) throw new Error("Failed to create activity");

        const result = await response.json();

        // Convert to Activity type
        const newActivity: Activity = {
          ...activity,
          id: result.activity?.id || `db-new-${Date.now()}`,
          applicants: [],
          createdAt: new Date().toISOString(),
          status: "pending",
        };

        await loadDbActivities();
        return newActivity;
      } catch (error) {
        console.error("Error creating activity:", error);
        throw error;
      }
    },
    [loadDbActivities]
  );

  // ========== USER FUNCTIONS (localStorage) ==========

  const addUser = useCallback(
    (
      user: Omit<AppUser, "id" | "joinDate" | "activitiesJoined" | "status">
    ) => {
      const newUser: AppUser = {
        ...user,
        id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // ========== ACTIVITY FUNCTIONS (localStorage) ==========

  const addActivity = useCallback(
    (activity: Omit<Activity, "id" | "applicants" | "createdAt">) => {
      const newActivity: Activity = {
        ...activity,
        id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
    // Combine localStorage approved activities with database approved activities
    const localApproved = data.activities.filter(
      (a) => a.status === "approved"
    );
    const dbApproved = dbActivitiesState.approved;

    // Create a map to avoid duplicates
    const activityMap = new Map();

    // Add local activities first
    localApproved.forEach((activity) => {
      activityMap.set(activity.id, activity);
    });

    // Add database activities (will overwrite local if same ID)
    dbApproved.forEach((activity) => {
      activityMap.set(activity.id, activity);
    });

    return Array.from(activityMap.values());
  }, [data.activities, dbActivitiesState.approved]);

  const getPendingActivities = useCallback(() => {
    // Combine localStorage pending activities with database pending activities
    const localPending = data.activities.filter((a) => a.status === "pending");
    const dbPending = dbActivitiesState.pending;

    // Create a map to avoid duplicates
    const activityMap = new Map();

    // Add local activities first
    localPending.forEach((activity) => {
      activityMap.set(activity.id, activity);
    });

    // Add database activities (will overwrite local if same ID)
    dbPending.forEach((activity) => {
      activityMap.set(activity.id, activity);
    });

    return Array.from(activityMap.values());
  }, [data.activities, dbActivitiesState.pending]);

  // ========== NOTIFICATION FUNCTIONS (localStorage) ==========

  const addNotification = useCallback(
    (notification: Omit<Notification, "id" | "createdAt">) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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

  // ========== UTILITY FUNCTIONS ==========

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
      {
        id: "user-2",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "user123",
        role: "user",
        joinDate: "2024-10-20",
        activitiesJoined: 2,
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
        applicants: ["user-2"],
        createdAt: new Date().toISOString(),
      },
      {
        id: "activity-2",
        title: "Food Bank Support",
        description: "Help sort and distribute food to families in need.",
        category: "community",
        image: "/food-bank.jpg",
        date: "2024-12-20",
        time: "10:00 AM",
        location: "Community Food Bank",
        maxApplicants: 30,
        status: "approved",
        organizerId: "admin-1",
        organizerName: "Admin User",
        organizerEmail: "admin@example.com",
        applicants: [],
        createdAt: new Date().toISOString(),
      },
    ];

    const mockNotifications: Notification[] = [
      {
        id: "notif-1",
        title: "Welcome to VolunteerMe!",
        message: "Thank you for joining our volunteer community.",
        type: "announcement",
        sender: "System",
        senderRole: "admin",
        targetUsers: ["all"],
        timestamp: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
    ];

    setData({
      users: mockUsers,
      activities: mockActivities,
      notifications: mockNotifications,
    });

    // Also refresh database activities
    loadDbActivities();
  }, [loadDbActivities]);

  const clearAllData = useCallback(() => {
    setData(defaultState);
    setDbActivitiesState({
      pending: [],
      approved: [],
      rejected: [],
      counts: { pending: 0, approved: 0, rejected: 0 },
      loading: false,
    });
  }, []);

  // ========== RETURN OBJECT ==========

  return {
    // Users
    users: data.users,
    addUser,
    deleteUser,
    getUserById,

    // Activities (localStorage)
    activities: getApprovedActivities(), // Show approved by default
    addActivity,
    updateActivityStatus,
    deleteActivity,
    applyToActivity,
    unapplyFromActivity,
    getApprovedActivities,
    getPendingActivities,

    // Database activities
    dbActivities: {
      pending: dbActivitiesState.pending,
      approved: dbActivitiesState.approved,
      rejected: dbActivitiesState.rejected,
      counts: dbActivitiesState.counts,
      loading: dbActivitiesState.loading,
      refresh: loadDbActivities,
      approveActivity: dbApproveActivity,
      rejectActivity: dbRejectActivity,
      deleteActivity: dbDeleteActivity,
      createActivity: dbCreateActivity,
    },

    // Notifications
    notifications: data.notifications,
    addNotification,
    deleteNotification,
    getNotificationsForUser,

    // Utilities
    initializeWithMockData,
    clearAllData,
  };
}
