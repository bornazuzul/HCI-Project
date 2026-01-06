import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, desc, asc, count } from "drizzle-orm";

// Get activities by status for admin
export async function getActivitiesByStatus(
  status: "pending" | "approved" | "rejected"
) {
  const data = await db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      category: activities.category,
      date: activities.date,
      time: activities.time,
      location: activities.location,
      maxApplicants: activities.maxApplicants,
      organizerId: activities.organizerId,
      organizerName: activities.organizerName,
      organizerEmail: activities.organizerEmail,
      status: activities.status,
      createdAt: activities.createdAt,
    })
    .from(activities)
    .where(eq(activities.status, status))
    .orderBy(desc(activities.createdAt));

  return data;
}

// Update activity status (approve/reject)
export async function updateActivityStatus(
  activityId: string,
  status: "pending" | "approved" | "rejected"
) {
  const result = await db
    .update(activities)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning();

  return result[0];
}

// Delete activity (soft delete - set status to 'deleted')
export async function deleteActivity(activityId: string) {
  const result = await db
    .update(activities)
    .set({
      status: "deleted",
      updatedAt: new Date(),
    })
    .where(eq(activities.id, activityId))
    .returning();

  return result[0];
}

// Get all approved activities for main page
export async function getApprovedActivitiesPaginated(
  page: number,
  pageSize: number,
  category?: string
) {
  const validatedPage = Math.max(1, page);
  const offset = (validatedPage - 1) * pageSize;

  let query = db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      category: activities.category,
      date: activities.date,
      time: activities.time,
      location: activities.location,
      maxApplicants: activities.maxApplicants,
    })
    .from(activities)
    .where(eq(activities.status, "approved"));

  if (category && category.trim() !== "") {
    query = query.where(eq(activities.category, category));
  }

  const data = await query
    .orderBy(asc(activities.date))
    .limit(pageSize)
    .offset(offset);

  return data;
}

export async function getActivityCounts() {
  try {
    // Try to get counts by status
    const [pending, approved, rejected] = await Promise.all([
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "pending")),
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "approved")),
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "rejected")),
    ]);

    return {
      pending: Number(pending[0]?.count) || 0,
      approved: Number(approved[0]?.count) || 0,
      rejected: Number(rejected[0]?.count) || 0,
    };
  } catch (error) {
    console.error(
      "Error getting activity counts, falling back to total count:",
      error
    );
    // Fallback if status column doesn't exist
    const total = await db.select({ count: count() }).from(activities);
    const totalCount = Number(total[0]?.count) || 0;

    return {
      pending: 0,
      approved: totalCount, // Assume all are approved
      rejected: 0,
    };
  }
}

// export async function createUserActivity(data: {
//   title: string;
//   description: string;
//   category: string;
//   date: string;
//   time: string;
//   location: string;
//   maxApplicants: number;
//   organizerId: string;
//   organizerName?: string;
//   organizerEmail?: string;
// }) {
//   const result = await db
//     .insert(activities)
//     .values({
//       ...data,
//       status: "pending",
//       organizerName: data.organizerName || "Unknown",
//       organizerEmail: data.organizerEmail || "unknown@example.com",
//     })
//     .returning();

//   return result[0];
// }
