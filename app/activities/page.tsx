import { notFound } from "next/navigation";
import ActivitiesPageClient from "./page.client";
import { loadActivitiesSearchParams } from "@/lib/activities-search-params";
import { SearchParams } from "nuqs";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase";

interface ActivitiesPageSearchParams {
  searchParams: Promise<SearchParams>;
}

const PAGE_SIZE = 6;

async function getCurrentUser() {
  try {
    const supabase = createClient();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      console.log("No session found");
      return null;
    }

    console.log("Session user ID:", session.user.id);
    console.log("Session user:", session.user);

    // Get user profile from profiles table (which has uuid id)
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("id", session.user.id)
      .single();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }

    console.log("User profile:", profile);
    return profile;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageSearchParams) {
  // Load search params
  const { page, category, my } = await loadActivitiesSearchParams(searchParams);

  // Get current user
  const user = await getCurrentUser();
  const userId = user?.id;

  console.log("=== ACTIVITIES PAGE DEBUG ===");
  console.log("User ID:", userId);
  console.log("User:", user);
  console.log("Category filter:", category);
  console.log("My filter:", my);
  console.log("Show my activities:", my === "true" && !!userId);

  // Validate inputs
  const validatedPage = Math.max(1, page);
  const categoryFilter = category?.trim() || "all";
  const showMyActivities = my === "true" && userId;
  const offset = (validatedPage - 1) * PAGE_SIZE;

  console.log("Building query with filters:");
  console.log("- Status: approved");
  console.log("- Show my activities:", showMyActivities);
  console.log("- User ID for filter:", userId);
  console.log("- Category filter:", categoryFilter);

  // Build query
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
  if (showMyActivities && userId) {
    console.log("Applying 'My Activities' filter with user ID:", userId);
    console.log("User ID type:", typeof userId);

    // Get sample activities to see organizerId format
    const sampleActivity = await db
      .select({ organizerId: activities.organizerId })
      .from(activities)
      .limit(1)
      .then((res) => res[0]);

    console.log("Sample activity organizerId:", sampleActivity?.organizerId);
    console.log("Sample organizerId type:", typeof sampleActivity?.organizerId);

    // Try casting userId to match organizerId type
    query = query.where(eq(activities.organizerId, userId));
  }

  // Apply category filter (only if not showing "My Activities")
  if (categoryFilter !== "all" && !showMyActivities) {
    console.log("Applying category filter:", categoryFilter);
    query = query.where(eq(activities.category, categoryFilter));
  }

  // Get paginated results
  const activitiesData = await query
    .orderBy(asc(activities.date))
    .limit(PAGE_SIZE)
    .offset(offset);

  console.log("Fetched activities count:", activitiesData.length);
  console.log(
    "Activities data:",
    activitiesData.map((a) => ({
      id: a.id,
      title: a.title,
      organizerId: a.organizerId,
      organizerName: a.organizerName,
    }))
  );

  // Get total count
  let countQuery = db
    .select({ count: sql<number>`count(*)` })
    .from(activities)
    .where(eq(activities.status, "approved"));

  if (showMyActivities && userId) {
    countQuery = countQuery.where(eq(activities.organizerId, userId));
  }

  if (categoryFilter !== "all" && !showMyActivities) {
    countQuery = countQuery.where(eq(activities.category, categoryFilter));
  }

  const countResult = await countQuery;
  const total = Number(countResult[0]?.count) || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  console.log("Total activities:", total);
  console.log("Total pages:", totalPages);

  // Handle page out of bounds
  if (validatedPage > totalPages && totalPages > 0) {
    notFound();
  }

  // Get all unique categories from activities
  const allCategories = [...new Set(activitiesData.map((a) => a.category))];

  return (
    <ActivitiesPageClient
      initialActivities={activitiesData}
      initialFilters={{
        category: categoryFilter,
        page: validatedPage,
        my: showMyActivities,
      }}
      categories={allCategories}
      totalPages={totalPages}
      currentPage={validatedPage}
      userId={userId}
    />
  );
}
