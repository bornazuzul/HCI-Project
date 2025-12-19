// app/api/pages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { pages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const data = await db
      .select({
        id: pages.id,
        title: pages.title,
        path: pages.path,
      })
      .from(pages)
      .where(eq(pages.includeInProd, true))
      .orderBy(asc(pages.displayOrder), asc(pages.id));

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages" },
      { status: 500 }
    );
  }
}
