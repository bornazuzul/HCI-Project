import { NextRequest, NextResponse } from "next/server";
import {
  getActivityApplications,
  createActivityApplication,
  deleteActivityApplication,
} from "@/lib/api/user-activities";

// POST: Apply to an activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activityId, userId } = body;

    if (!activityId || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await createActivityApplication(activityId, userId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully applied to the activity",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error applying to activity:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

// GET: Get applicants for an activity
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

    const applicants = await getActivityApplications(activityId);

    return NextResponse.json({
      success: true,
      data: applicants,
    });
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

    await deleteActivityApplication(activityId, userId);

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully",
    });
  } catch (error: any) {
    console.error("Error withdrawing application:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}
