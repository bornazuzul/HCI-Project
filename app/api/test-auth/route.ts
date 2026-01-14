import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();

    const session = await auth.api.getSession({
      headers: new Headers(),
    });

    return NextResponse.json({
      success: true,
      session: session || null,
      cookies: allCookies.map((c) => ({
        name: c.name,
        value: c.value ? "***" : "empty",
      })),
      hasSessionCookie: allCookies.some((c) => c.name.includes("better-auth")),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
