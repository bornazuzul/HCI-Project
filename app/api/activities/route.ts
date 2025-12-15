// app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { z } from "zod";
import { asc, eq, sql, count, and } from "drizzle-orm";

// Validation schema
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
  date: z.string().refine((val) => {
    const selectedDate = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, "Date cannot be in the past"),
  time: z.string(),
  location: z.string().min(3, "Please provide a valid location"),
  maxApplicants: z
    .number()
    .min(1, "Must be at least 1 volunteer")
    .max(500, "Maximum 500 volunteers"),
  organizerId: z.string(),
  organizerName: z.string().optional(),
  organizerEmail: z.string().optional(),
});

// POST /api/activities - Create a new activity
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate input
    const validationResult = createActivitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.errors,
        },
        { status: 400 }
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
      organizerId,
      organizerName,
      organizerEmail,
    } = validationResult.data;

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
        organizerId,
        organizerName: organizerName || "Unknown",
        organizerEmail: organizerEmail || "unknown@example.com",
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
          status: activity.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to create activity",
      },
      { status: 500 }
    );
  }
}

// GET /api/activities - Get all approved activities (optional, for your existing fetch)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");

    const offset = (page - 1) * pageSize;

    let query = db
      .select()
      .from(activities)
      .where(eq(activities.status, "approved"));

    if (category && category !== "all") {
      query = query.where(eq(activities.category, category));
    }

    const data = await query
      .orderBy(asc(activities.date))
      .limit(pageSize)
      .offset(offset);

    // Get total count for pagination
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(activities)
      .where(eq(activities.status, "approved"));

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
      { success: false, error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
