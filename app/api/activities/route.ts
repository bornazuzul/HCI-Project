import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities, profiles } from "@/db/schema";
import { z } from "zod";
import { eq, asc, sql, and } from "drizzle-orm";

const createActivitySchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title is too long"),
  description: z
    .string()
    .min(20, "Please provide more details (min 20 characters)")
    .max(2000, "Description is too long"),
  category: z.enum([
    "sports",
    "education",
    "community",
    "environment",
    "health",
    "other",
  ]),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Time must be in HH:MM format"),
  location: z.string().min(3, "Please provide a valid location"),
  maxApplicants: z
    .number()
    .min(1, "Must be at least 1 volunteer")
    .max(500, "Maximum 500 volunteers"),
});

// Type for activity form data
type ActivityFormData = z.infer<typeof createActivitySchema>;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const organizerId = searchParams.get("organizerId");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    const offset = (page - 1) * pageSize;

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
        status: activities.status,
        createdAt: activities.createdAt,
        updatedAt: activities.updatedAt,
      })
      .from(activities)
      .where(eq(activities.status, status));

    // Apply filters
    if (category && category !== "all") {
      query = query.where(eq(activities.category, category));
    }

    if (organizerId) {
      query = query.where(eq(activities.organizerId, organizerId));
    }

    // Execute query
    const data = await query
      .orderBy(asc(activities.date), asc(activities.time))
      .limit(pageSize)
      .offset(offset);

    // Get total count
    let countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(eq(activities.status, status));

    if (category && category !== "all") {
      countQuery = countQuery.where(eq(activities.category, category));
    }

    if (organizerId) {
      countQuery = countQuery.where(eq(activities.organizerId, organizerId));
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
        hasNextPage: page * pageSize < total,
        hasPrevPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Error fetching activities:", error);

    // Return empty response for now
    return NextResponse.json({
      success: true,
      data: [],
      pagination: {
        page: 1,
        pageSize: 6,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Expect userId to be sent from client
    const { userId, ...activityData } = body;

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in.",
        },
        { status: 401 }
      );
    }

    // Validate the activity data
    const validationResult = createActivitySchema.safeParse(activityData);
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

    const validatedData = validationResult.data;

    // Date validation
    const selectedDate = new Date(validatedData.date);
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

    // Get user profile
    const profile = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, userId))
      .then((res) => res[0]);

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "User profile not found. Please complete your profile first.",
        },
        { status: 404 }
      );
    }

    // Check if user has a name
    if (!profile.name || profile.name.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Please complete your profile name before creating activities.",
        },
        { status: 400 }
      );
    }

    const [activity] = await db
      .insert(activities)
      .values({
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        date: validatedData.date,
        time: validatedData.time,
        location: validatedData.location,
        maxApplicants: validatedData.maxApplicants,
        currentApplicants: 0, // Initialize to 0
        organizerId: profile.id,
        organizerName: profile.name,
        organizerEmail: profile.email,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

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
          organizerName: activity.organizerName,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating activity:", error);

    // Handle specific errors
    let errorMessage = "Failed to create activity";
    let statusCode = 500;

    if (error.message?.includes("foreign key")) {
      errorMessage = "User profile issue. Please try logging in again.";
      statusCode = 400;
    } else if (
      error.message?.includes("duplicate key") ||
      error.code === "23505"
    ) {
      errorMessage = "An activity with similar details already exists.";
      statusCode = 409;
    } else if (
      error.message?.includes("null value") ||
      error.code === "23502"
    ) {
      errorMessage = "Missing required information. Please check all fields.";
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
