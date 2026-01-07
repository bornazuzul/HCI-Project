import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { z } from "zod";
import { eq, asc, sql, count, and } from "drizzle-orm";

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
    const userId = searchParams.get("userId");
    const myActivities = searchParams.get("myActivities") === "true";
    const appliedActivities = searchParams.get("applied") === "true";

    // Check if it's an admin request (no pagination needed)
    const isAdminRequest =
      searchParams.get("admin") === "true" ||
      (status && ["pending", "approved", "rejected"].includes(status));

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
      .from(activities);

    // Apply filters based on request type
    if (myActivities && userId) {
      // Filter: Show only activities created by this user
      query = query.where(
        and(eq(activities.organizerId, userId), eq(activities.status, status))
      );
    } else if (appliedActivities && userId) {
      // Filter: Show activities user has applied to
      // Note: This requires a join with activity_applications table
      // We'll handle this separately if needed
      query = query.where(eq(activities.status, status));
    } else {
      // Default: Show activities with the specified status
      query = query.where(eq(activities.status, status));
    }

    if (category && category !== "all") {
      query = query.where(eq(activities.category, category));
    }

    // For admin requests, get all activities without pagination
    if (isAdminRequest) {
      const data = await query.orderBy(
        asc(activities.date),
        asc(activities.time)
      );

      return NextResponse.json({
        success: true,
        data,
        count: data.length,
      });
    }
    // For regular requests, use pagination
    else {
      const data = await query
        .orderBy(asc(activities.date), asc(activities.time))
        .limit(pageSize)
        .offset(offset);

      // Get total count
      let countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(activities)
        .where(eq(activities.status, status));

      if (myActivities && userId) {
        countQuery = countQuery.where(eq(activities.organizerId, userId));
      }

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
    }
  } catch (error: any) {
    console.error("Error fetching activities:", error);

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "approved";
    const isAdminRequest =
      searchParams.get("admin") === "true" ||
      (status && ["pending", "approved", "rejected"].includes(status));

    if (isAdminRequest) {
      return NextResponse.json({
        success: true,
        data: [],
        count: 0,
      });
    } else {
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
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { userId, organizer_name, organizer_email, ...activityData } = body;

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

    console.log("Creating activity with:", {
      userId,
      organizer_name,
      organizer_email,
      activityData: validatedData,
    });

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
        organizerName: organizer_name || "User",
        organizerEmail: organizer_email || "user@example.com",
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
          organizerEmail: activity.organizerEmail,
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, activityId } = body;

    if (!action || !activityId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: action and activityId",
        },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'approve' or 'reject'",
        },
        { status: 400 }
      );
    }

    const status = action === "approve" ? "approved" : "rejected";

    // Update activity status
    const [updatedActivity] = await db
      .update(activities)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    if (!updatedActivity) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Activity ${action}d successfully`,
      data: updatedActivity,
    });
  } catch (error: any) {
    console.error("Error updating activity status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update activity status",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");

    if (!activityId) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity ID is required",
        },
        { status: 400 }
      );
    }

    // Soft delete by setting status to 'deleted'
    const [deletedActivity] = await db
      .update(activities)
      .set({
        status: "deleted",
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .returning();

    if (!deletedActivity) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Activity deleted successfully",
      data: deletedActivity,
    });
  } catch (error: any) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete activity",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

// New endpoint to get activities user has applied to
export async function GET_APPLIED(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    // This would require a join with activity_applications
    // For now, we'll return an empty array
    return NextResponse.json({
      success: true,
      data: [],
    });
  } catch (error: any) {
    console.error("Error fetching applied activities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applied activities" },
      { status: 500 }
    );
  }
}
