// lib/api/client.ts
// Client-side API calls (no database imports here)

export async function fetchActivitiesByStatus(
  status: "pending" | "approved" | "rejected"
) {
  const response = await fetch(`/api/activities?status=${status}`);
  if (!response.ok) throw new Error("Failed to fetch activities");
  return response.json();
}

export async function createActivity(activityData: any) {
  const response = await fetch("/api/activities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(activityData),
  });
  if (!response.ok) throw new Error("Failed to create activity");
  return response.json();
}

export async function updateActivityStatus(
  id: string,
  status: "pending" | "approved" | "rejected"
) {
  const response = await fetch("/api/activities", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, status }),
  });
  if (!response.ok) throw new Error("Failed to update activity");
  return response.json();
}

export async function deleteActivity(id: string) {
  const response = await fetch(`/api/activities?id=${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete activity");
  return response.json();
}

export async function getActivityStats() {
  // For client-side, you might want a separate endpoint for stats
  // Or combine multiple calls
  const [pending, approved, rejected] = await Promise.all([
    fetch("/api/activities?status=pending").then((r) => r.json()),
    fetch("/api/activities?status=approved").then((r) => r.json()),
    fetch("/api/activities?status=rejected").then((r) => r.json()),
  ]);

  return {
    pending: pending.activities?.length || 0,
    approved: approved.activities?.length || 0,
    rejected: rejected.activities?.length || 0,
  };
}
