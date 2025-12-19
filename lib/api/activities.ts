import { db } from "@/db";
import { activities } from "@/db/schema";
import { asc, eq, sql, count, and } from "drizzle-orm";

export async function getActivitiesPaginated(
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
      organizerId: activities.organizerId,
      status: activities.status,
    })
    .from(activities);

  // Only show approved activities to regular users
  query = query.where(eq(activities.status, "approved"));

  if (category && category.trim() !== "") {
    query = query.where(eq(activities.category, category));
  }

  const data = await query
    .orderBy(asc(activities.date))
    .limit(pageSize)
    .offset(offset);

  return data;
}

export async function getActivitiesCount(category?: string) {
  let whereCondition = eq(activities.status, "approved");

  if (category && category.trim() !== "") {
    whereCondition = and(
      eq(activities.status, "approved"),
      eq(activities.category, category)
    );
  }

  const result = await db
    .select({
      count: count(),
    })
    .from(activities)
    .where(whereCondition);

  return Number(result[0]?.count) || 0;
}

// Keep this for getting activity by ID (now includes status check)
export async function getActivityById(id: string) {
  const data = await db
    .select()
    .from(activities)
    .where(
      and(
        eq(activities.id, id),
        eq(activities.status, "approved") // Only get approved activities
      )
    )
    .limit(1);

  return data[0] ?? null;
}

// New function to get activity by ID for admin (includes all statuses)
export async function getActivityByIdAdmin(id: string) {
  const data = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  return data[0] ?? null;
}
