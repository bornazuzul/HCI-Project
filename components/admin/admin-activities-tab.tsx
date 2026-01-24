"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Activity {
  id: string;
  title: string;
  description: string;
  organizerName: string;
  organizerEmail: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxApplicants: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

// Helper functions for API calls
const fetchActivitiesByStatus = async (status: string): Promise<Activity[]> => {
  try {
    const response = await fetch(`/api/activities?status=${status}`);

    if (!response.ok) {
      let errorMessage = `Failed to fetch ${status} activities`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = `${response.status} ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (!data.data && !Array.isArray(data)) {
      console.error("Unexpected API response structure:", data);
      return [];
    }

    const activities = data.data || data;
    return Array.isArray(activities) ? activities : [];
  } catch (error) {
    console.error(`Error fetching ${status} activities:`, error);
    return [];
  }
};

const fetchActivityCounts = async (): Promise<{
  pending: number;
  approved: number;
  rejected: number;
}> => {
  try {
    const response = await fetch("/api/activities/counts");

    if (response.ok) {
      const data = await response.json();
      return {
        pending: data.pending || 0,
        approved: data.approved || 0,
        rejected: data.rejected || 0,
      };
    }

    // Fallback: count from individual status fetches
    // console.log("Counts endpoint failed, using fallback...");
    const [pending, approved, rejected] = await Promise.all([
      fetchActivitiesByStatus("pending"),
      fetchActivitiesByStatus("approved"),
      fetchActivitiesByStatus("rejected"),
    ]);

    return {
      pending: pending.length,
      approved: approved.length,
      rejected: rejected.length,
    };
  } catch (error) {
    console.error("Error fetching activity counts:", error);
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
  }
};

const updateActivityStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected",
): Promise<void> => {
  const action = status === "approved" ? "approve" : "reject";

  const response = await fetch("/api/activities", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action,
      activityId: id,
    }),
  });

  if (!response.ok) {
    let errorMessage = `Failed to ${action} activity`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
};

const deleteActivity = async (id: string): Promise<void> => {
  const response = await fetch(`/api/activities?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let errorMessage = "Failed to delete activity";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch {
      errorMessage = `${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
};

export default function AdminActivitiesTab() {
  const [activities, setActivities] = useState<Record<string, Activity[]>>({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [processing, setProcessing] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    loadAllActivities();
  }, []);

  const loadAllActivities = async () => {
    setLoading(true);
    try {
      // console.log("Loading all activities...");

      // Fetch activities by status in parallel
      const [pending, approved, rejected] = await Promise.all([
        fetchActivitiesByStatus("pending"),
        fetchActivitiesByStatus("approved"),
        fetchActivitiesByStatus("rejected"),
      ]);

      // console.log("Fetched activities:", {
      //   pending: pending.length,
      //   approved: approved.length,
      //   rejected: rejected.length,
      // });

      const activityCounts = await fetchActivityCounts();

      // Sort activities by createdAt date in descending order (newest first)
      const sortByCreatedAtDesc = (a: Activity, b: Activity) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      };

      setActivities({
        pending: [...pending].sort(sortByCreatedAtDesc),
        approved: [...approved].sort(sortByCreatedAtDesc),
        rejected: [...rejected].sort(sortByCreatedAtDesc),
      });
      setCounts(activityCounts);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading activities:", error);
      alert(
        "Failed to load activities. Please check your connection and try again.",
      );

      setActivities({
        pending: [],
        approved: [],
        rejected: [],
      });
      setCounts({
        pending: 0,
        approved: 0,
        rejected: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      // console.log("Approving activity:", id);
      await updateActivityStatus(id, "approved");
      await loadAllActivities();
    } catch (error) {
      console.error("Error approving activity:", error);
      alert(
        `Failed to approve activity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      // console.log("Rejecting activity:", id);
      await updateActivityStatus(id, "rejected");
      await loadAllActivities();
    } catch (error) {
      console.error("Error rejecting activity:", error);
      alert(
        `Failed to reject activity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this activity? This action cannot be undone.",
      )
    ) {
      return;
    }

    setProcessing(id);
    try {
      // console.log("Deleting activity:", id);
      await deleteActivity(id);
      await loadAllActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
      alert(
        `Failed to delete activity: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      );
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const ActivityList = ({
    items,
    showActions = false,
  }: {
    items: Activity[];
    showActions?: boolean;
  }) => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </Card>
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <Card className="p-8 text-center text-muted-foreground">
          {showActions
            ? "No pending activities to review"
            : "No activities to display"}
        </Card>
      );
    }

    return (
      <div className="space-y-3">
        {items.map((activity) => (
          <Card
            key={activity.id}
            className="p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                <div className="flex-grow">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold text-lg text-foreground">
                      {activity.title}
                    </h4>
                    <span
                      className={`inline-block px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                        activity.category === "environment"
                          ? "bg-green-100 text-green-700"
                          : activity.category === "community"
                            ? "bg-blue-100 text-blue-700"
                            : activity.category === "education"
                              ? "bg-purple-100 text-purple-700"
                              : activity.category === "sports"
                                ? "bg-orange-100 text-orange-700"
                                : activity.category === "health"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {activity.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap">
                  Submitted: {formatDateTime(activity.createdAt)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">
                    Event Date & Time:
                  </span>
                  <p className="text-foreground font-medium">
                    {formatDate(activity.date)} at {activity.time}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="text-foreground font-medium">
                    {activity.location}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Capacity:</span>
                  <p className="text-foreground font-medium">
                    {activity.maxApplicants} volunteers
                  </p>
                </div>
              </div>

              <div className="bg-muted/50 rounded p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Organizer
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">
                    {activity.organizerName}
                  </p>
                  <a
                    href={`mailto:${activity.organizerEmail}`}
                    className="text-xs text-primary hover:underline"
                  >
                    {activity.organizerEmail}
                  </a>
                </div>
              </div>

              {showActions && (
                <div className="flex gap-2 flex-wrap pt-2 border-t border-border">
                  <Button
                    size="sm"
                    onClick={() => handleApprove(activity.id)}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                    disabled={processing === activity.id}
                  >
                    {processing === activity.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(activity.id)}
                    className="gap-1 text-red-600 border-red-600 hover:bg-red-50"
                    disabled={processing === activity.id}
                  >
                    {processing === activity.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </Button>
                </div>
              )}

              {!showActions && (
                <div className="flex gap-2 justify-end pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(activity.id)}
                    className="gap-1 text-red-600 border-red-200 hover:bg-red-50"
                    disabled={processing === activity.id}
                  >
                    {processing === activity.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Activity Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Review and manage volunteer activities
            {lastUpdated && (
              <span className="text-xs ml-2">
                (Last updated:{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                )
              </span>
            )}
          </p>
        </div>
        <Button
          onClick={loadAllActivities}
          variant="outline"
          size="sm"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Card className="p-4 border-l-4 border-l-yellow-500">
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            {counts.pending}
          </div>
          <div className="text-sm text-muted-foreground">Pending Review</div>
        </Card>
        <Card className="p-4 border-l-4 border-l-green-500">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {counts.approved}
          </div>
          <div className="text-sm text-muted-foreground">
            Approved Activities
          </div>
        </Card>
        <Card className="p-4 border-l-4 border-l-red-500">
          <div className="text-2xl font-bold text-red-600 mb-1">
            {counts.rejected}
          </div>
          <div className="text-sm text-muted-foreground">
            Rejected Activities
          </div>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="pending" className="relative">
            Pending
            {activities.pending.length > 0 && (
              <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                {activities.pending.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({activities.approved.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({activities.rejected.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Pending Activities ({activities.pending.length})
            </h3>
            {activities.pending.length > 0 && (
              <span className="text-sm text-muted-foreground">
                Newest first • Requires admin review
              </span>
            )}
          </div>
          <ActivityList items={activities.pending} showActions />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Approved Activities ({activities.approved.length})
            </h3>
            {activities.approved.length > 0 && (
              <span className="text-sm text-green-600">
                Newest first • Visible to volunteers
              </span>
            )}
          </div>
          <ActivityList items={activities.approved} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Rejected Activities ({activities.rejected.length})
            </h3>
            {activities.rejected.length > 0 && (
              <span className="text-sm text-red-600">
                Newest first • Hidden from volunteers
              </span>
            )}
          </div>
          <ActivityList items={activities.rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
