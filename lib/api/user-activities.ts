import { db } from "@/db";
import { activities, activityApplications } from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// Helper function to determine ID type
function isUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
}

// Get activity by ID
export async function getActivityById(id: string) {
  try {
    const result = await db
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

    return result[0] || null;
  } catch (error) {
    console.error("Error getting activity by ID:", error);
    return null;
  }
}

// Get activity applications for a specific activity
export async function getActivityApplications(activityId: string) {
  try {
    // Use raw SQL with proper handling for postgres-js
    const result = await db.execute<{
      applicationId: string;
      userId: string;
      appliedAt: Date;
      userName: string;
      userEmail: string;
      userRole: string;
    }>(sql`
      SELECT 
        aa.id as "applicationId",
        -- Return the correct user ID based on what's stored
        CASE 
          WHEN aa.better_auth_user_id IS NOT NULL THEN aa.better_auth_user_id
          ELSE aa.user_id::text
        END as "userId",
        aa.created_at as "appliedAt",
        -- Get user info from the appropriate table
        COALESCE(u.name, p.name) as "userName",
        COALESCE(u.email, p.email) as "userEmail",
        COALESCE(u.role, p.role) as "userRole"
      FROM activity_applications aa
      LEFT JOIN "user" u ON aa.better_auth_user_id = u.id
      LEFT JOIN profiles p ON aa.user_id = p.id
      WHERE aa.activity_id = ${activityId}
      ORDER BY aa.created_at DESC
    `);

    // postgres-js returns array directly
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error getting activity applications:", error);
    return [];
  }
}

// Check if user has applied to an activity
export async function hasUserApplied(activityId: string, userId: string) {
  try {
    if (isUUID(userId)) {
      // Check user_id (UUID)
      const result = await db
        .select({ id: activityApplications.id })
        .from(activityApplications)
        .where(
          and(
            eq(activityApplications.activityId, activityId),
            eq(activityApplications.userId, userId)
          )
        )
        .limit(1);

      return result.length > 0;
    } else {
      // Check better_auth_user_id (text)
      const result = await db.execute(sql`
        SELECT id FROM activity_applications 
        WHERE activity_id = ${activityId}
        AND better_auth_user_id = ${userId}
        LIMIT 1
      `);

      // postgres-js returns array directly
      return Array.isArray(result) && result.length > 0;
    }
  } catch (error) {
    console.error("Error checking if user applied:", error);
    return false;
  }
}

// Create application for an activity
export async function createActivityApplication(
  activityId: string,
  userId: string,
  userEmail?: string,
  userName?: string
) {
  try {
    // First check if activity exists and has available spots
    const activity = await getActivityById(activityId);
    if (!activity) {
      throw new Error("Activity not found");
    }

    if (activity.status !== "approved") {
      throw new Error("Activity is not available for applications");
    }

    if (activity.currentApplicants >= activity.maxApplicants) {
      throw new Error("No spots available");
    }

    // Check if user is the organizer - check both organizer ID fields
    const isOrganizer =
      (activity.organizerId && activity.organizerId === userId) ||
      (activity.betterAuthOrganizerId &&
        activity.betterAuthOrganizerId === userId);

    if (isOrganizer) {
      throw new Error("You cannot apply to your own activity");
    }

    // Check if already applied
    const hasApplied = await hasUserApplied(activityId, userId);
    if (hasApplied) {
      throw new Error("You have already applied to this activity");
    }

    if (isUUID(userId)) {
      // Use user_id field for UUID
      await db
        .insert(activityApplications)
        .values({
          activityId,
          userId,
          createdAt: new Date(),
        })
        .execute();
    } else {
      // Use better_auth_user_id field for text IDs
      await db.execute(sql`
        INSERT INTO activity_applications (activity_id, better_auth_user_id, created_at)
        VALUES (${activityId}, ${userId}, NOW())
      `);
    }

    // Update applicant count
    await db
      .update(activities)
      .set({
        currentApplicants: (activity.currentApplicants || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(activities.id, activityId))
      .execute();

    return { success: true };
  } catch (error: any) {
    console.error("Error creating activity application:", error);
    throw error;
  }
}

// Delete application (withdraw)
export async function deleteActivityApplication(
  activityId: string,
  userId: string
) {
  try {
    // Get current activity to update count
    const activity = await getActivityById(activityId);

    let deletedCount = 0;

    if (isUUID(userId)) {
      // Delete using user_id field
      const result = await db
        .delete(activityApplications)
        .where(
          and(
            eq(activityApplications.activityId, activityId),
            eq(activityApplications.userId, userId)
          )
        )
        .execute();

      // For postgres-js, we need to check differently
      deletedCount = 1; // Assume successful if no error
    } else {
      // Delete using better_auth_user_id field
      await db.execute(sql`
        DELETE FROM activity_applications 
        WHERE activity_id = ${activityId}
        AND better_auth_user_id = ${userId}
      `);

      deletedCount = 1; // Assume successful if no error
    }

    if (deletedCount === 0) {
      throw new Error("Application not found");
    }

    // Update applicant count
    if (activity && activity.currentApplicants > 0) {
      await db
        .update(activities)
        .set({
          currentApplicants: Math.max(0, activity.currentApplicants - 1),
          updatedAt: new Date(),
        })
        .where(eq(activities.id, activityId))
        .execute();
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting activity application:", error);
    throw error;
  }
}
