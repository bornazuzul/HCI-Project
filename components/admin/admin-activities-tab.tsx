"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getActivitiesByStatus,
  updateActivityStatus,
  deleteActivity,
  getActivityCounts,
} from "@/lib/api/user-activities";

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

  // Load activities on component mount
  useEffect(() => {
    loadAllActivities();
  }, []);

  const loadAllActivities = async () => {
    setLoading(true);
    try {
      const [pending, approved, rejected, activityCounts] = await Promise.all([
        getActivitiesByStatus("pending"),
        getActivitiesByStatus("approved"),
        getActivitiesByStatus("rejected"),
        getActivityCounts(),
      ]);

      setActivities({
        pending,
        approved,
        rejected,
      });
      setCounts(activityCounts);
    } catch (error) {
      console.error("Error loading activities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessing(id);
    try {
      await updateActivityStatus(id, "approved");
      // Refresh the activities list
      await loadAllActivities();
    } catch (error) {
      console.error("Error approving activity:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessing(id);
    try {
      await updateActivityStatus(id, "rejected");
      // Refresh the activities list
      await loadAllActivities();
    } catch (error) {
      console.error("Error rejecting activity:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async (id: string) => {
    setProcessing(id);
    try {
      await deleteActivity(id);
      // Refresh the activities list
      await loadAllActivities();
    } catch (error) {
      console.error("Error deleting activity:", error);
    } finally {
      setProcessing(null);
    }
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
          <Card key={activity.id} className="p-4">
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
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {activity.category}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {activity.description}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Submitted {new Date(activity.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Date & Time:</span>
                  <p className="text-foreground font-medium">
                    {new Date(activity.date).toLocaleDateString()} at{" "}
                    {activity.time}
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
                    className="gap-1"
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
                    className="gap-1"
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
                    className="gap-1"
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
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Pending Activities ({activities.pending.length})
          </h3>
          <ActivityList items={activities.pending} showActions />
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Approved Activities ({activities.approved.length})
          </h3>
          <ActivityList items={activities.approved} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Rejected Activities ({activities.rejected.length})
          </h3>
          <ActivityList items={activities.rejected} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
