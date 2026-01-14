import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    return NextResponse.json({
      success: true,
      session: session || null,
    });
  } catch (error: any) {
    console.error("Error getting session:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        session: null,
      },
      { status: 500 }
    );
  }
}
