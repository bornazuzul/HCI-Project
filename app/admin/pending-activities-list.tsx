// app/admin/pending-activities-list.tsx - UPDATED VERSION
"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, X, Calendar, MapPin, Users, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxApplicants: number;
  organizerId: string;
  organizerName?: string;
  organizerEmail?: string;
  status: string;
  createdAt: Date;
  updatedAt?: Date;
}

// API helper functions - using YOUR existing API structure
const getPendingActivities = async (): Promise<Activity[]> => {
  const response = await fetch("/api/activities?status=pending");

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch pending activities");
  }

  const data = await response.json();
  return data.data || [];
};

const approveActivity = async (activityId: string): Promise<void> => {
  const response = await fetch("/api/activities", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "approve",
      activityId: activityId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to approve activity");
  }
};

const rejectActivity = async (activityId: string): Promise<void> => {
  const response = await fetch("/api/activities", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "reject",
      activityId: activityId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to reject activity");
  }
};

export default function PendingActivitiesList() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  // Load pending activities
  useEffect(() => {
    loadPendingActivities();
  }, []);

  const loadPendingActivities = async () => {
    try {
      setLoading(true);
      const data = await getPendingActivities();
      setActivities(data);
    } catch (error: any) {
      console.error("Error loading pending activities:", error);
      toast.error(error.message || "Failed to load pending activities");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (activityId: string) => {
    setProcessing(activityId);
    try {
      await approveActivity(activityId);

      // Remove from list
      setActivities((prev) => prev.filter((a) => a.id !== activityId));

      toast.success("Activity approved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to approve activity");
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (activityId: string) => {
    setProcessing(activityId);
    try {
      await rejectActivity(activityId);

      // Remove from list
      setActivities((prev) => prev.filter((a) => a.id !== activityId));

      toast.success("Activity rejected");
    } catch (error: any) {
      toast.error(error.message || "Failed to reject activity");
      console.error(error);
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  };

  // Category badge colors
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      environment: "bg-emerald-100 text-emerald-800",
      community: "bg-blue-100 text-blue-800",
      education: "bg-purple-100 text-purple-800",
      health: "bg-red-100 text-red-800",
      animals: "bg-amber-100 text-amber-800",
      sports: "bg-orange-100 text-orange-800",
      other: "bg-gray-100 text-gray-800",
    };
    return colors[category.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <div className="flex flex-col gap-2 min-w-[200px]">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          All activities reviewed!
        </h3>
        <p className="text-gray-500 mb-6">
          No pending activities at the moment. Check back later.
        </p>
        <Button
          onClick={loadPendingActivities}
          variant="outline"
          className="gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {activities.length} pending activit
          {activities.length === 1 ? "y" : "ies"}
        </p>
        <Button
          onClick={loadPendingActivities}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </Button>
      </div>

      {activities.map((activity) => (
        <div
          key={activity.id}
          className="border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            {/* Activity Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getCategoryColor(
                        activity.category
                      )}`}
                    >
                      {activity.category.charAt(0).toUpperCase() +
                        activity.category.slice(1)}
                    </span>
                    <span className="px-2.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Pending Review
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {activity.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {activity.description}
                  </p>
                </div>

                <div className="text-xs text-gray-500">
                  Submitted{" "}
                  {new Date(activity.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>

              {/* Activity Details */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Date</p>
                    <p className="text-sm font-medium">
                      {formatDate(activity.date)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Time</p>
                    <p className="text-sm font-medium">{activity.time}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Location</p>
                    <p className="text-sm font-medium truncate">
                      {activity.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Capacity</p>
                    <p className="text-sm font-medium">
                      {activity.maxApplicants} volunteers
                    </p>
                  </div>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">
                      {activity.organizerName ? "Organizer" : "Organizer ID"}
                    </p>
                    <p className="text-sm font-medium font-mono">
                      {activity.organizerName ||
                        activity.organizerId?.slice(0, 8) + "..."}
                    </p>
                  </div>
                </div>
                {activity.organizerEmail && (
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.organizerEmail}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 min-w-[200px]">
              <Button
                onClick={() => handleApprove(activity.id)}
                disabled={processing === activity.id}
                className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
              >
                {processing === activity.id ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Approve
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleReject(activity.id)}
                disabled={processing === activity.id}
                variant="outline"
                className="w-full border-red-300 text-red-700 hover:bg-red-50 gap-2"
              >
                {processing === activity.id ? (
                  <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Reject
                  </>
                )}
              </Button>

              <div className="text-xs text-gray-500 text-center mt-2">
                ID: {activity.id.slice(0, 8)}...
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
