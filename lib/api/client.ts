export async function fetchActivitiesByStatus(
  status: "pending" | "approved" | "rejected"
) {
  const response = await fetch(`/api/activities?status=${status}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch activities");
  }
  const data = await response.json();
  return data.data || []; // Return the data array
}

export async function createActivity(activityData: any) {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activityData),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create activity");
  }
  return response.json();
}

export async function updateActivityStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
) {
  const action = status === "approved" ? "approve" : "reject";

  const response = await fetch("/api/activities", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, activityId: id }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update activity");
  }
  return response.json();
}

export async function deleteActivity(id: string) {
  const response = await fetch(`/api/activities?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete activity");
  }
  return response.json();
}

export async function getActivityStats() {
  try {
    // Use the counts endpoint
    const response = await fetch("/api/activities/counts");
    if (!response.ok) {
      throw new Error("Failed to fetch activity stats");
    }
    const data = await response.json();

    return {
      pending: data.pending || 0,
      approved: data.approved || 0,
      rejected: data.rejected || 0,
      total: data.total || 0,
    };
  } catch (error) {
    console.error("Error fetching activity stats:", error);

    // Fallback to fetching all statuses individually
    const [pending, approved, rejected] = await Promise.all([
      fetchActivitiesByStatus("pending"),
      fetchActivitiesByStatus("approved"),
      fetchActivitiesByStatus("rejected"),
    ]);

    return {
      pending: pending.length || 0,
      approved: approved.length || 0,
      rejected: rejected.length || 0,
      total:
        (pending.length || 0) + (approved.length || 0) + (rejected.length || 0),
    };
  }
}
