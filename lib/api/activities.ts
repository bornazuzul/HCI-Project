import { db } from "@/db";
import { activities } from "@/db/schema";
import { asc, eq, count } from "drizzle-orm";

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
    })
    .from(activities);

  // Apply category filter if provided
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
  try {
    // Simple count approach that works with Drizzle
    let whereCondition = undefined;

    if (category && category.trim() !== "") {
      whereCondition = eq(activities.category, category);
    }

    const result = await db
      .select({
        count: count(),
      })
      .from(activities)
      .where(whereCondition);

    return Number(result[0]?.count) || 0;
  } catch (error) {
    console.error("Error counting activities:", error);
    return 0;
  }
}

// Keep your existing functions
export async function getActivities() {
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
    })
    .from(activities)
    .orderBy(asc(activities.date));

  return data;
}

export async function getActivityById(id: string) {
  const data = await db
    .select()
    .from(activities)
    .where(eq(activities.id, id))
    .limit(1);

  return data[0] ?? null;
}
