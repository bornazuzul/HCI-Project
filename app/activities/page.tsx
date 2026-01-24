import { notFound } from "next/navigation";
import ActivitiesPageClient from "./page.client";
import { loadActivitiesSearchParams } from "@/lib/activities-search-params";
import { SearchParams } from "nuqs";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, asc, sql, and, gte, lte } from "drizzle-orm";
import { cookies } from "next/headers";

interface ActivitiesPageSearchParams {
  searchParams: Promise<SearchParams>;
}

const PAGE_SIZE = 6;

async function getCurrentUser() {
  try {
    // Get cookies for the session
    const cookieStore = await cookies();
    const headers = new Headers();

    // Forward all cookies to the auth API
    cookieStore.getAll().forEach((cookie) => {
      headers.append("cookie", `${cookie.name}=${cookie.value}`);
    });

    // Call Better Auth API to get session
    const response = await fetch(
      `${
        process.env.BETTER_AUTH_URL || "http://localhost:3000"
      }/api/auth/session`,
      {
        headers: headers,
        credentials: "include",
        cache: "no-store",
      },
    );

    if (!response.ok) {
      // console.log("No Better Auth session found - API error:", response.status);
      return null;
    }

    const result = await response.json();

    if (!result?.success || !result?.session?.user) {
      console.log("No user in session or API call failed");
      return null;
    }

    const sessionUser = result.session.user;
    // console.log("Better Auth user ID:", sessionUser.id);
    // console.log("Better Auth user:", sessionUser);

    return {
      id: sessionUser.id,
      name: sessionUser.name || "",
      email: sessionUser.email || "",
      role: sessionUser.role || "user",
    };
  } catch (error) {
    console.error("Error getting current user from Better Auth:", error);
    return null;
  }
}

// Helper function to determine ID type
function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

// Helper function to format date as YYYY-MM-DD string
function formatDateToYMD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Helper function to get date range based on filter
function getDateRangeCondition(dateFilter: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // This week: Sunday to Saturday
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  // Next week
  const nextWeekStart = new Date(startOfWeek);
  nextWeekStart.setDate(startOfWeek.getDate() + 7);
  const nextWeekEnd = new Date(endOfWeek);
  nextWeekEnd.setDate(endOfWeek.getDate() + 7);

  // This month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Next month
  const nextMonthStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const nextMonthEnd = new Date(today.getFullYear(), today.getMonth() + 2, 0);

  switch (dateFilter) {
    case "today":
      return {
        startDate: formatDateToYMD(today),
        endDate: formatDateToYMD(today),
      };
    case "tomorrow":
      return {
        startDate: formatDateToYMD(tomorrow),
        endDate: formatDateToYMD(tomorrow),
      };
    case "this-week":
      return {
        startDate: formatDateToYMD(startOfWeek),
        endDate: formatDateToYMD(endOfWeek),
      };
    case "next-week":
      return {
        startDate: formatDateToYMD(nextWeekStart),
        endDate: formatDateToYMD(nextWeekEnd),
      };
    case "this-month":
      return {
        startDate: formatDateToYMD(startOfMonth),
        endDate: formatDateToYMD(endOfMonth),
      };
    case "next-month":
      return {
        startDate: formatDateToYMD(nextMonthStart),
        endDate: formatDateToYMD(nextMonthEnd),
      };
    case "upcoming":
      return {
        startDate: formatDateToYMD(today),
        endDate: null,
      };
    case "past":
      return {
        startDate: null,
        endDate: formatDateToYMD(new Date(today.getTime() - 86400000)),
      };
    default:
      return { startDate: null, endDate: null };
  }
}

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageSearchParams) {
  // Load search params
  const { page, category, my, date } =
    await loadActivitiesSearchParams(searchParams);

  // Get current user
  const user = await getCurrentUser();
  const userId = user?.id;

  // console.log("=== ACTIVITIES PAGE DEBUG ===");
  // console.log("User ID:", userId);
  // console.log("User:", user);
  // console.log("Category filter:", category);
  // console.log("My filter:", my);
  // console.log("Date filter:", date);
  // console.log("Show my activities:", my === "true" && !!userId);

  // Validate inputs
  const validatedPage = Math.max(1, page);
  const categoryFilter = category?.trim() || "all";
  const showMyActivities = my === "true" && userId;
  const dateFilter = date || "all";
  const offset = (validatedPage - 1) * PAGE_SIZE;

  // console.log("Building query with filters:");
  // console.log("- Status: approved");
  // console.log("- Show my activities:", showMyActivities);
  // console.log("- User ID for filter:", userId);
  // console.log("- Category filter:", categoryFilter);
  // console.log("- Date filter:", dateFilter);

  let activitiesData: any[] = [];
  let total = 0;

  // Get date range if date filter is active
  const dateRange = getDateRangeCondition(dateFilter);
  const dateFilterActive = dateFilter && dateFilter !== "all";

  // console.log("Date range condition:", dateRange);
  if (showMyActivities && userId) {
    // console.log("Applying 'My Activities' filter with user ID:", userId);
    // console.log("User ID type:", typeof userId);
    // console.log("Is UUID:", isUUID(userId));

    let myActivitiesConditions = [eq(activities.status, "approved")];

    // Add date filter if active - using strings instead of Date objects
    if (dateFilterActive) {
      if (dateRange.startDate && dateRange.endDate) {
        myActivitiesConditions.push(
          and(
            gte(activities.date, dateRange.startDate),
            lte(activities.date, dateRange.endDate),
          ),
        );
      } else if (dateRange.startDate) {
        myActivitiesConditions.push(gte(activities.date, dateRange.startDate));
      } else if (dateRange.endDate) {
        myActivitiesConditions.push(lte(activities.date, dateRange.endDate));
      }
    }

    // Add user ID condition
    if (isUUID(userId)) {
      myActivitiesConditions.push(eq(activities.organizerId, userId));
    } else {
      myActivitiesConditions.push(eq(activities.betterAuthOrganizerId, userId));
    }

    // Create query
    let myActivitiesQuery = db
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
      })
      .from(activities)
      .where(and(...myActivitiesConditions));

    // Get paginated results
    activitiesData = await myActivitiesQuery
      .orderBy(asc(activities.date))
      .limit(PAGE_SIZE)
      .offset(offset);

    // Get count for "My Activities"
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(and(...myActivitiesConditions));

    const countResult = await countQuery;
    total = Number(countResult[0]?.count) || 0;
  } else {
    // Regular query for non-"My Activities"
    const conditions = [eq(activities.status, "approved")];

    if (categoryFilter !== "all") {
      conditions.push(eq(activities.category, categoryFilter));
    }

    // Add date filter if active - using strings instead of Date objects
    if (dateFilterActive) {
      if (dateRange.startDate && dateRange.endDate) {
        conditions.push(
          and(
            gte(activities.date, dateRange.startDate),
            lte(activities.date, dateRange.endDate),
          ),
        );
      } else if (dateRange.startDate) {
        conditions.push(gte(activities.date, dateRange.startDate));
      } else if (dateRange.endDate) {
        conditions.push(lte(activities.date, dateRange.endDate));
      }
    }

    // console.log("SQL conditions:", conditions);

    const query = db
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
      })
      .from(activities)
      .where(and(...conditions));

    // Get paginated results
    activitiesData = await query
      .orderBy(asc(activities.date))
      .limit(PAGE_SIZE)
      .offset(offset);

    // Get total count
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(and(...conditions));

    const countResult = await countQuery;
    total = Number(countResult[0]?.count) || 0;
  }

  // console.log("Fetched activities count:", activitiesData.length);
  // console.log(
  //   "Activities data:",
  //   activitiesData.map((a: any) => ({
  //     id: a.id,
  //     title: a.title,
  //     date: a.date,
  //     status: a.status,
  //     organizerId: a.organizerId,
  //     betterAuthOrganizerId: a.betterAuthOrganizerId,
  //     organizerName: a.organizerName,
  //   }))
  // );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // console.log("Total activities:", total);
  // console.log("Total pages:", totalPages);

  // Handle page out of bounds
  if (validatedPage > totalPages && totalPages > 0) {
    notFound();
  }

  // Get all unique categories from activities
  const allCategories = [
    ...new Set(activitiesData.map((a: any) => a.category)),
  ];

  return (
    <ActivitiesPageClient
      initialActivities={activitiesData}
      initialFilters={{
        category: categoryFilter,
        page: validatedPage,
        my: showMyActivities,
        date: dateFilter,
      }}
      categories={allCategories}
      totalPages={totalPages}
      currentPage={validatedPage}
      userId={userId}
    />
  );
}
