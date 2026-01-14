import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Activity ID is required" },
        { status: 400 }
      );
    }

    const activity = await db
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
      .where(eq(activities.id, id))
      .then((res) => res[0]);

    if (!activity) {
      return NextResponse.json(
        { success: false, error: "Activity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: activity,
    });
  } catch (error: any) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch activity",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
