// app/api/activities/route.ts - UPDATED FOR NEW USER SYSTEM
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { z } from "zod";
import { eq, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";

// Validation schema for activity creation
const createActivitySchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(20, "Please provide more details").max(2000),
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
  maxApplicants: z.number().min(1, "Must be at least 1 volunteer").max(500),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");
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

    if (category && category !== "all") {
      query = query.where(eq(activities.category, category));
    }

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

    // Get user from the user table
    const user = await db
      .select()
      .from(activities)
      .where(eq(activities.organizerId, userId))
      .then((res) => res[0]);

    // For now, we'll use the provided userId directly
    // In production, you'd want to fetch the user from the user table
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
        currentApplicants: 0,
        organizerId: userId,
        organizerName: "User", // You'll need to get this from the user table
        organizerEmail: "user@example.com", // You'll need to get this from the user table
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
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create activity",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
