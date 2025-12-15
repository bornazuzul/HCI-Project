// app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, profiles } from "@/db/schema";
import { z } from "zod";
import { eq, asc, sql } from "drizzle-orm";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Validation schema - client only sends activity data, user comes from auth
const createActivitySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title is too long"),
  description: z
    .string()
    .min(20, "Please provide more details (min 20 characters)")
    .max(500, "Description is too long"),
  category: z.string(),
  date: z.string(),
  time: z.string(),
  location: z.string().min(3, "Please provide a valid location"),
  maxApplicants: z
    .number()
    .min(1, "Must be at least 1 volunteer")
    .max(500, "Maximum 500 volunteers"),
});

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    // Get Supabase client for authentication
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in.",
        },
        { status: 401 }
      );
    }

    // Parse the request body
    const body = await request.json();

    // Validate activity data (doesn't include user info)
    const validationResult = createActivitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    // Get or create user profile
    let profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .then((res) => res[0]);

    // If profile doesn't exist, create one
    if (!profile) {
      console.log("Creating new profile for user:", user.id);
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: user.id,
          email: user.email || "unknown@example.com",
          name: user.user_metadata?.name || "Anonymous User",
          role: "user",
          createdAt: new Date(),
        })
        .returning();

      profile = newProfile;
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create or find user profile",
        },
        { status: 500 }
      );
    }

    const {
      title,
      description,
      category,
      date,
      time,
      location,
      maxApplicants,
    } = validationResult.data;

    // Additional date validation
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return NextResponse.json(
        {
          success: false,
          error: "Date cannot be in the past",
        },
        { status: 400 }
      );
    }

    // Insert into database
    const [activity] = await db
      .insert(activities)
      .values({
        title,
        description,
        category,
        date,
        time,
        location,
        maxApplicants,
        organizerId: profile.id, // Use the UUID from profiles
        organizerName: profile.name || "Anonymous",
        organizerEmail: profile.email,
        status: "pending",
        createdAt: new Date(),
      })
      .returning();

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Activity submitted successfully for review",
        data: {
          id: activity.id,
          title: activity.title,
          category: activity.category,
          date: activity.date,
          status: activity.status,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating activity:", error);

    // Provide user-friendly error messages
    let errorMessage = "Failed to create activity";
    let statusCode = 500;

    if (error.code === "23505") {
      errorMessage = "An activity with similar details already exists";
      statusCode = 409;
    } else if (error.code === "22P02") {
      errorMessage = "Invalid data format";
      statusCode = 400;
    } else if (error.message?.includes("foreign key")) {
      errorMessage = "User profile not found. Please complete your profile.";
      statusCode = 400;
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: statusCode }
    );
  }
}

// GET /api/activities - Get all approved activities with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");
    const status = searchParams.get("status") || "approved"; // Default to approved

    const offset = (page - 1) * pageSize;

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
        organizerId: activities.organizerId,
        organizerName: activities.organizerName,
        organizerEmail: activities.organizerEmail,
        status: activities.status,
        createdAt: activities.createdAt,
      })
      .from(activities)
      .where(eq(activities.status, status));

    // Apply category filter if provided and not "all"
    if (category && category !== "all") {
      query = query.where(eq(activities.category, category));
    }

    // Execute query with pagination
    const data = await query
      .orderBy(asc(activities.date))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(eq(activities.status, status));

    if (category && category !== "all") {
      countQuery = countQuery.where(eq(activities.category, category));
    }

    const countResult = await countQuery;
    const total = Number(countResult[0]?.count) || 0;

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activities",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
