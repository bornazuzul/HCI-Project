import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import ActivityPageClient from "./page.client";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    // Use Drizzle query builder (reliable and type-safe)
    const activityResult = await db
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
        betterAuthOrganizerId: activities.betterAuthOrganizerId,
        organizerName: activities.organizerName,
        organizerEmail: activities.organizerEmail,
        status: activities.status,
        createdAt: activities.createdAt,
        updatedAt: activities.updatedAt,
      })
      .from(activities)
      .where(eq(activities.id, id))
      .limit(1);

    const activity = activityResult[0];

    if (!activity) {
      notFound();
    }

    // Safely convert numbers to prevent NaN
    const safeNumber = (value: any, defaultValue: number = 0): number => {
      if (value === null || value === undefined) return defaultValue;
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    // Format dates properly
    const formatDate = (date: Date | string | null | undefined): string => {
      if (!date) return "";
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toISOString().split("T")[0];
      } catch {
        return "";
      }
    };

    const formatDateTime = (date: Date | string | null | undefined): string => {
      if (!date) return new Date().toISOString();
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        return dateObj.toISOString();
      } catch {
        return new Date().toISOString();
      }
    };

    const formattedActivity = {
      id: activity.id,
      title: activity.title || "",
      description: activity.description || "",
      category: activity.category || "other",
      date: formatDate(activity.date),
      time: activity.time || "00:00",
      location: activity.location || "",
      maxApplicants: safeNumber(activity.maxApplicants, 10),
      currentApplicants: safeNumber(activity.currentApplicants, 0),
      organizerId: activity.organizerId || activity.betterAuthOrganizerId || "",
      betterAuthOrganizerId: activity.betterAuthOrganizerId,
      organizerName: activity.organizerName || "Organizer",
      organizerEmail: activity.organizerEmail || "organizer@example.com",
      status: activity.status || "approved",
      createdAt: formatDateTime(activity.createdAt),
      updatedAt: formatDateTime(activity.updatedAt),
    };

    return <ActivityPageClient initialActivity={formattedActivity} />;
  } catch (error) {
    console.error("Error fetching activity:", error);
    notFound();
  }
}
