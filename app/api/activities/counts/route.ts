import { NextResponse } from "next/server";
import { db } from "@/db";
import { activities } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  try {
    // Get counts for each status in parallel
    const [pendingResult, approvedResult, rejectedResult] = await Promise.all([
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "pending")),
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "approved")),
      db
        .select({ count: count() })
        .from(activities)
        .where(eq(activities.status, "rejected")),
    ]);

    const counts = {
      pending: Number(pendingResult[0]?.count) || 0,
      approved: Number(approvedResult[0]?.count) || 0,
      rejected: Number(rejectedResult[0]?.count) || 0,
      total:
        Number(pendingResult[0]?.count || 0) +
        Number(approvedResult[0]?.count || 0) +
        Number(rejectedResult[0]?.count || 0),
    };

    return NextResponse.json({
      success: true,
      ...counts,
    });
  } catch (error) {
    console.error("Error fetching activity counts:", error);

    // Return default counts on error
    return NextResponse.json({
      success: false,
      pending: 0,
      approved: 0,
      rejected: 0,
      total: 0,
      error: "Failed to fetch counts, using defaults",
    });
  }
}
