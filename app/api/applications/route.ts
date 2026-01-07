import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityApplications, activities, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// POST: Apply to an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, userId, userName, userEmail } = body;

    if (!activityId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if activity exists and has available spots
    const activity = await db
      .select()
      .from(activities)
      .where(eq(activities.id, activityId))
      .then((res) => res[0]);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Activity not found" },
        { status: 404 }
      );
    }

    if (activity.status !== "approved") {
      return NextResponse.json(
        {
          success: false,
          error: "This activity is not available for applications",
        },
        { status: 400 }
      );
    }

    if (activity.currentApplicants >= activity.maxApplicants) {
      return NextResponse.json(
        { success: false, error: "No spots available" },
        { status: 400 }
      );
    }

    // Check if user already applied
    const existingApplication = await db
      .select()
      .from(activityApplications)
      .where(
        and(
          eq(activityApplications.activityId, activityId),
          eq(activityApplications.userId, userId)
        )
      )
      .then((res) => res[0]);

    if (existingApplication) {
      return NextResponse.json(
        { success: false, error: "You have already applied to this activity" },
        { status: 400 }
      );
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Create application
      await tx.insert(activityApplications).values({
        activityId,
        userId,
      });

      // Update activity applicant count
      await tx
        .update(activities)
        .set({
          currentApplicants: activity.currentApplicants + 1,
          updatedAt: new Date(),
        })
        .where(eq(activities.id, activityId));
    });

    return NextResponse.json(
      {
        success: true,
        message: "Successfully applied to the activity",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error applying to activity:", error);

    // Check for unique constraint violation
    if (error.code === "23505") {
      return NextResponse.json(
        { success: false, error: "You have already applied to this activity" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to apply to activity" },
      { status: 500 }
    );
  }
}

// GET: Get applicants for an activity (with user info from profiles)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const activityId = searchParams.get("activityId");

    if (!activityId) {
      return NextResponse.json(
        { success: false, error: "activityId is required" },
        { status: 400 }
      );
    }

    // Get all applicants for this activity with their profile info
    const applicants = await db
      .select({
        applicationId: activityApplications.id,
        userId: activityApplications.userId,
        appliedAt: activityApplications.createdAt,
        userName: profiles.name,
        userEmail: profiles.email,
        userRole: profiles.role,
      })
      .from(activityApplications)
      .innerJoin(profiles, eq(activityApplications.userId, profiles.id))
      .where(eq(activityApplications.activityId, activityId))
      .orderBy(desc(activityApplications.createdAt));

    return NextResponse.json({ success: true, data: applicants });
  } catch (error: any) {
    console.error("Error fetching applicants:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applicants" },
      { status: 500 }
    );
  }
}

// DELETE: Withdraw application
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, userId } = body;

    if (!activityId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if application exists
    const application = await db
      .select()
      .from(activityApplications)
      .where(
        and(
          eq(activityApplications.activityId, activityId),
          eq(activityApplications.userId, userId)
        )
      )
      .then((res) => res[0]);

    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    // Start transaction
    await db.transaction(async (tx) => {
      // Delete application
      await tx
        .delete(activityApplications)
        .where(
          and(
            eq(activityApplications.activityId, activityId),
            eq(activityApplications.userId, userId)
          )
        );

      // Update activity applicant count
      const activity = await tx
        .select()
        .from(activities)
        .where(eq(activities.id, activityId))
        .then((res) => res[0]);

      if (activity && activity.currentApplicants > 0) {
        await tx
          .update(activities)
          .set({
            currentApplicants: Math.max(0, activity.currentApplicants - 1),
            updatedAt: new Date(),
          })
          .where(eq(activities.id, activityId));
      }
    });

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to withdraw application" },
      { status: 500 }
    );
  }
}
