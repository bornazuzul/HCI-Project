import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, desc, asc, count, and } from "drizzle-orm";

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
      currentApplicants: activities.currentApplicants,
      organizerId: activities.organizerId,
      organizerName: activities.organizerName,
      organizerEmail: activities.organizerEmail,
      status: activities.status,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
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
  category?: string,
  userId?: string,
  my?: boolean
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
      currentApplicants: activities.currentApplicants,
      organizerId: activities.organizerId,
      organizerName: activities.organizerName,
      organizerEmail: activities.organizerEmail,
    })
    .from(activities)
    .where(eq(activities.status, "approved"));

  // Apply "My Activities" filter
  if (my && userId) {
    query = query.where(eq(activities.organizerId, userId));
  }

  // Apply category filter (only if not showing "My Activities")
  if (category && category.trim() !== "" && !my) {
    query = query.where(eq(activities.category, category));
  }

  const data = await query
    .orderBy(asc(activities.date))
    .limit(pageSize)
    .offset(offset);

  return data;
}

// Get user's own activities (created by user)
export async function getMyActivitiesPaginated(
  page: number,
  pageSize: number,
  userId: string
) {
  const validatedPage = Math.max(1, page);
  const offset = (validatedPage - 1) * pageSize;

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
      currentApplicants: activities.currentApplicants,
      organizerId: activities.organizerId,
      organizerName: activities.organizerName,
      organizerEmail: activities.organizerEmail,
      status: activities.status,
    })
    .from(activities)
    .where(
      and(eq(activities.organizerId, userId), eq(activities.status, "approved"))
    )
    .orderBy(desc(activities.createdAt))
    .limit(pageSize)
    .offset(offset);

  return data;
}

// Get count of user's activities
export async function getMyActivityCount(userId: string) {
  const result = await db
    .select({ count: count() })
    .from(activities)
    .where(
      and(eq(activities.organizerId, userId), eq(activities.status, "approved"))
    );

  return Number(result[0]?.count) || 0;
}

export async function getActivityCounts(
  category?: string,
  userId?: string,
  my?: boolean
) {
  try {
    let query = db.select({ count: count() }).from(activities);

    // Always filter by approved status for regular users
    query = query.where(eq(activities.status, "approved"));

    // Apply "My Activities" filter
    if (my && userId) {
      query = query.where(eq(activities.organizerId, userId));
    }

    // Apply category filter (only if not showing "My Activities")
    if (category && category.trim() !== "" && !my) {
      query = query.where(eq(activities.category, category));
    }

    const result = await query;
    const approvedCount = Number(result[0]?.count) || 0;

    // Get pending count for admin
    const pendingResult = await db
      .select({ count: count() })
      .from(activities)
      .where(eq(activities.status, "pending"));

    const pendingCount = Number(pendingResult[0]?.count) || 0;

    // Get rejected count for admin
    const rejectedResult = await db
      .select({ count: count() })
      .from(activities)
      .where(eq(activities.status, "rejected"));

    const rejectedCount = Number(rejectedResult[0]?.count) || 0;

    return {
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
    };
  } catch (error) {
    console.error("Error getting activity counts:", error);
    return {
      pending: 0,
      approved: 0,
      rejected: 0,
    };
  }
}

// Get single activity by ID
export async function getActivityById(id: string) {
  const result = await db
    .select({
      id: activities.id,
      title: activities.title,
      description: activities.description,
      category: activities.category,
      date: activities.date,
      time: activities.time,
      location: activities.location,
      maxApplicants: activities.maxApplicants,
      currentApplicants: activities.currentApplicants,
      organizerId: activities.organizerId,
      organizerName: activities.organizerName,
      organizerEmail: activities.organizerEmail,
      status: activities.status,
      createdAt: activities.createdAt,
      updatedAt: activities.updatedAt,
    })
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  return result[0] || null;
}
