import { db } from "@/db";
import { activities } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

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
    .where(eq(activities.id, id)) // Query using the string id directly
    .limit(1);

  return data[0] ?? null;
}
