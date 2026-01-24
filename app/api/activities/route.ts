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

// Helper function to determine ID type
function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id,
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If an ID is provided, return single activity
    if (id) {
      // Use Drizzle query builder instead of raw SQL
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
        return NextResponse.json(
          { success: false, error: "Activity not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          id: activity.id,
          title: activity.title,
          description: activity.description,
          category: activity.category,
          date: activity.date
            ? new Date(activity.date).toISOString().split("T")[0]
            : "",
          time: activity.time,
          location: activity.location,
          maxApplicants: Number(activity.maxApplicants) || 0,
          currentApplicants: Number(activity.currentApplicants) || 0,
          organizerId: activity.organizerId || activity.betterAuthOrganizerId,
          betterAuthOrganizerId: activity.betterAuthOrganizerId,
          organizerName: activity.organizerName,
          organizerEmail: activity.organizerEmail,
          status: activity.status,
          createdAt: activity.createdAt
            ? new Date(activity.createdAt).toISOString()
            : new Date().toISOString(),
          updatedAt: activity.updatedAt
            ? new Date(activity.updatedAt).toISOString()
            : new Date().toISOString(),
        },
      });
    }

    const category = searchParams.get("category");
    const status = searchParams.get("status") || "approved";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "6");
    const offset = (page - 1) * pageSize;
    const userId = searchParams.get("userId");
    const my = searchParams.get("my") === "true";

    // Check if it's an admin request
    const isAdminRequest =
      searchParams.get("admin") === "true" ||
      (status && ["pending", "approved", "rejected"].includes(status));

    // Build query using Drizzle query builder
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
        betterAuthOrganizerId: activities.betterAuthOrganizerId,
        organizerName: activities.organizerName,
        organizerEmail: activities.organizerEmail,
        status: activities.status,
        createdAt: activities.createdAt,
        updatedAt: activities.updatedAt,
      })
      .from(activities);

    // Apply status filter
    if (isAdminRequest) {
      query = query.where(eq(activities.status, status));
    } else {
      query = query.where(eq(activities.status, "approved"));
    }

    // Apply "My Activities" filter
    if (my && userId) {
      // For BetterAuth IDs (strings)
      if (!isUUID(userId)) {
        query = query.where(eq(activities.betterAuthOrganizerId, userId));
      } else {
        // For UUIDs
        query = query.where(eq(activities.organizerId, userId));
      }
    }

    // Apply category filter (only if not showing "My Activities")
    if (category && category !== "all" && !my) {
      query = query.where(eq(activities.category, category));
    }

    if (isAdminRequest) {
      const data = await query.orderBy(
        asc(activities.date),
        asc(activities.time),
      );

      const formattedData = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        date: row.date ? new Date(row.date).toISOString().split("T")[0] : "",
        time: row.time,
        location: row.location,
        maxApplicants: Number(row.maxApplicants) || 0,
        currentApplicants: Number(row.currentApplicants) || 0,
        organizerId: row.organizerId || row.betterAuthOrganizerId,
        betterAuthOrganizerId: row.betterAuthOrganizerId,
        organizerName: row.organizerName,
        organizerEmail: row.organizerEmail,
        status: row.status,
        createdAt: row.createdAt
          ? new Date(row.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: row.updatedAt
          ? new Date(row.updatedAt).toISOString()
          : new Date().toISOString(),
      }));

      return NextResponse.json({
        success: true,
        data: formattedData,
        count: formattedData.length,
      });
    } else {
      // For regular requests, use pagination
      const data = await query
        .orderBy(asc(activities.date), asc(activities.time))
        .limit(pageSize)
        .offset(offset);

      const formattedData = data.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        category: row.category,
        date: row.date ? new Date(row.date).toISOString().split("T")[0] : "",
        time: row.time,
        location: row.location,
        maxApplicants: Number(row.maxApplicants) || 0,
        currentApplicants: Number(row.currentApplicants) || 0,
        organizerId: row.organizerId || row.betterAuthOrganizerId,
        betterAuthOrganizerId: row.betterAuthOrganizerId,
        organizerName: row.organizerName,
        organizerEmail: row.organizerEmail,
        status: row.status,
        createdAt: row.createdAt
          ? new Date(row.createdAt).toISOString()
          : new Date().toISOString(),
        updatedAt: row.updatedAt
          ? new Date(row.updatedAt).toISOString()
          : new Date().toISOString(),
      }));

      // Get total count with same filters
      let countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(activities);

      if (isAdminRequest) {
        countQuery = countQuery.where(eq(activities.status, status));
      } else {
        countQuery = countQuery.where(eq(activities.status, "approved"));
      }

      if (my && userId) {
        if (!isUUID(userId)) {
          countQuery = countQuery.where(
            eq(activities.betterAuthOrganizerId, userId),
          );
        } else {
          countQuery = countQuery.where(eq(activities.organizerId, userId));
        }
      }

      if (category && category !== "all" && !my) {
        countQuery = countQuery.where(eq(activities.category, category));
      }

      const countResult = await countQuery;
      const total = Number(countResult[0]?.count) || 0;

      return NextResponse.json({
        success: true,
        data: formattedData,
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
    // console.log("Activity POST Request Received");

    const body = await request.json();
    // console.log("Full Request body:", JSON.stringify(body, null, 2));

    // Get session from Better Auth
    // console.log("Attempting to get Better Auth session...");

    try {
      const cookie = request.headers.get("cookie") || "";
      // console.log("Cookie present:", cookie ? "Yes" : "No");
      // console.log("Cookie length:", cookie.length);

      const sessionResult = await auth.api.getSession({
        headers: {
          cookie: cookie,
        },
      });

      // console.log(
      //   "✅ Better Auth Session Result:",
      //   JSON.stringify(sessionResult, null, 2)
      // );

      if (!sessionResult || !sessionResult.user) {
        console.error("❌ No user in session:", sessionResult);
        return NextResponse.json(
          {
            success: false,
            error: "Authentication required. Please log in.",
            debug: "No user found in session",
          },
          { status: 401 },
        );
      }

      const sessionUser = sessionResult.user;
      // console.log("👤 Session User:", JSON.stringify(sessionUser, null, 2));

      // Type assertion for the user object with role
      const typedUser = sessionUser as any;
      const userRole = typedUser.role || "user";

      // console.log("👑 User role:", userRole);

      const validationResult = createActivitySchema.safeParse(body);
      if (!validationResult.success) {
        console.error("❌ Validation failed:", validationResult.error.errors);
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            details: validationResult.error.errors,
          },
          { status: 400 },
        );
      }

      const validatedData = validationResult.data;
      // console.log("✅ Validated data:", JSON.stringify(validatedData, null, 2));

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
          { status: 400 },
        );
      }

      // Use the session user information
      const finalUserId = sessionUser.id;
      const finalOrganizerName = sessionUser.name || "User";
      const finalOrganizerEmail = sessionUser.email || "user@example.com";

      // console.log("👥 Organizer info:", {
      //   userId: finalUserId,
      //   organizer_name: finalOrganizerName,
      //   organizer_email: finalOrganizerEmail,
      // });

      // Convert date string to ISO string for Drizzle (YYYY-MM-DD format)
      const activityDate = new Date(validatedData.date);
      const isoDateString = activityDate.toISOString().split("T")[0]; // Gets YYYY-MM-DD

      // console.log("📅 Date for database:", {
      //   input: validatedData.date,
      //   dateObject: activityDate.toString(),
      //   isoString: isoDateString,
      // });

      // ========== DEBUG SECTION ==========
      // console.log("🔍 ========== DEBUG SECTION ==========");
      // console.log("🔍 1. Testing Drizzle schema...");

      // // Check if activities table exists in schema
      // console.log("🔍 Activities table type:", typeof activities);
      // console.log("🔍 Activities table keys:", Object.keys(activities));

      // Create a test object with the exact structure
      const testActivityData = {
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        date: isoDateString,
        time: validatedData.time,
        location: validatedData.location,
        maxApplicants: validatedData.maxApplicants,
        currentApplicants: 0,
        organizerId: null,
        betterAuthOrganizerId: finalUserId,
        organizerName: finalOrganizerName,
        organizerEmail: finalOrganizerEmail,
        status: "pending",
      };

      try {
        const [testActivity1] = await db
          .insert(activities)
          .values(testActivityData)
          .returning();

        // console.log("Test 1 SUCCESS! Activity created:", {
        //   id: testActivity1.id,
        //   title: testActivity1.title,
        // });

        return NextResponse.json(
          {
            success: true,
            message: "Activity submitted successfully for review",
            data: {
              id: testActivity1.id,
              title: testActivity1.title,
              category: testActivity1.category,
              date: validatedData.date,
              status: testActivity1.status,
              organizerName: testActivity1.organizerName,
              organizerEmail: testActivity1.organizerEmail,
            },
          },
          { status: 201 },
        );
      } catch (testError1: any) {
        console.error("❌ Test 1 FAILED:", testError1.message);
        console.error("❌ Test 1 stack:", testError1.stack);

        // Test 2: Try with type assertion
        // console.log("🔍 5. Test 2: With type assertion (as any)...");
        try {
          const [testActivity2] = await db
            .insert(activities)
            .values(testActivityData as any)
            .returning();

          // console.log("Test 2 SUCCESS! Activity created:", testActivity2.id);

          return NextResponse.json(
            {
              success: true,
              message: "Activity submitted successfully for review",
              data: {
                id: testActivity2.id,
                title: testActivity2.title,
                category: testActivity2.category,
                date: validatedData.date,
                status: testActivity2.status,
                organizerName: testActivity2.organizerName,
                organizerEmail: testActivity2.organizerEmail,
              },
            },
            { status: 201 },
          );
        } catch (testError2: any) {
          console.error("❌ Test 2 FAILED:", testError2.message);

          // Test 3: Try with different null value
          console.log("🔍 6. Test 3: With undefined instead of null...");
          try {
            const testActivityData3 = {
              ...testActivityData,
              organizerId: undefined, // Try undefined instead of null
            };

            const [testActivity3] = await db
              .insert(activities)
              .values(testActivityData3 as any)
              .returning();

            // console.log(
            //   "✅ Test 3 SUCCESS! Activity created:",
            //   testActivity3.id
            // );

            return NextResponse.json(
              {
                success: true,
                message: "Activity submitted successfully for review",
                data: {
                  id: testActivity3.id,
                  title: testActivity3.title,
                  category: testActivity3.category,
                  date: validatedData.date,
                  status: testActivity3.status,
                  organizerName: testActivity3.organizerName,
                  organizerEmail: testActivity3.organizerEmail,
                },
              },
              { status: 201 },
            );
          } catch (testError3: any) {
            console.error("❌ Test 3 FAILED:", testError3.message);

            const columnNames = Object.keys(activities).filter(
              (key) => !key.startsWith("_"),
            );

            return NextResponse.json(
              {
                success: false,
                error: "Database insert failed after multiple attempts",
                debug: {
                  test1Error: testError1.message,
                  test2Error: testError2.message,
                  test3Error: testError3.message,
                  schemaColumns: columnNames,
                  attemptedData: testActivityData,
                },
                suggestion:
                  "Check if all required columns are provided and have correct types",
              },
              { status: 500 },
            );
          }
        }
      }
    } catch (sessionError: any) {
      console.error("❌ Session/DB error details:", {
        message: sessionError.message,
        stack: sessionError.stack,
        name: sessionError.name,
      });

      // More specific error handling
      if (
        sessionError.message.includes("string") &&
        sessionError.message.includes("Date")
      ) {
        console.error("⚠️ Date serialization error detected");
        return NextResponse.json(
          {
            success: false,
            error: "Date formatting error. Please check the date format.",
            debug: "Dates must be passed as strings to the database",
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: "Failed to create activity",
          debug: sessionError.message,
        },
        { status: 500 },
      );
    }
  } catch (error: any) {
    console.error("❌ Outer error creating activity:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create activity",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check authentication first
    const cookie = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookie,
      },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Check if user is admin (only admins can approve/reject)
    const typedUser = sessionResult.user as any;
    const userRole = typedUser.role || "user";

    if (userRole !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: "Only admins can approve/reject activities",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { action, activityId } = body;

    if (!action || !activityId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: action and activityId",
        },
        { status: 400 },
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid action. Must be 'approve' or 'reject'",
        },
        { status: 400 },
      );
    }

    const status = action === "approve" ? "approved" : "rejected";

    // console.log("🔧 Updating activity status:", {
    //   activityId,
    //   action,
    //   status,
    //   userRole,
    //   userId: sessionResult.user.id,
    // });

    // Update activity status - FIX: Use Date object for timestamp columns
    const [updatedActivity] = await db
      .update(activities)
      .set({
        status,
        updatedAt: new Date(), // Use Date object, not string
      })
      .where(eq(activities.id, activityId))
      .returning();

    if (!updatedActivity) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity not found",
        },
        { status: 404 },
      );
    }

    // console.log("Activity updated:", {
    //   id: updatedActivity.id,
    //   title: updatedActivity.title,
    //   newStatus: updatedActivity.status,
    // });

    return NextResponse.json({
      success: true,
      message: `Activity ${action}d successfully`,
      data: updatedActivity,
    });
  } catch (error: any) {
    console.error("❌ Error updating activity status:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update activity status",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const cookie = request.headers.get("cookie") || "";
    const sessionResult = await auth.api.getSession({
      headers: {
        cookie: cookie,
      },
    });

    if (!sessionResult || !sessionResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("id");

    if (!activityId) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity ID is required",
        },
        { status: 400 },
      );
    }

    // Optional: Check if user owns the activity or is admin
    const activity = await db
      .select({ betterAuthOrganizerId: activities.betterAuthOrganizerId })
      .from(activities)
      .where(eq(activities.id, activityId))
      .limit(1);

    if (activity.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Activity not found",
        },
        { status: 404 },
      );
    }

    // Allow deletion only if user is the organizer or an admin
    const typedUser = sessionResult.user as any;
    const isOwner = activity[0].betterAuthOrganizerId === sessionResult.user.id;
    const isAdmin = typedUser.role === "admin";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        {
          success: false,
          error: "You can only delete your own activities",
        },
        { status: 403 },
      );
    }

    // Soft delete by setting status to 'deleted' - FIX: Use Date object
    const [deletedActivity] = await db
      .update(activities)
      .set({
        status: "deleted",
        updatedAt: new Date(), // Use Date object, not string
      })
      .where(eq(activities.id, activityId))
      .returning();

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
      { status: 500 },
    );
  }
}
