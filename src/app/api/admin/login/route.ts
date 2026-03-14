import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const envUsername = process.env.ADMIN_PANEL_USERNAME;
    const envPassword = process.env.ADMIN_PANEL_PASSWORD;
    const envToken = process.env.ADMIN_PANEL_TOKEN;

    if (!envUsername || !envPassword || !envToken) {
      return NextResponse.json(
        { success: false, error: "Admin auth env vars are not configured" },
        { status: 500 },
      );
    }

    if (username !== envUsername || password !== envPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 },
      );
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set({
      name: COOKIE_NAME,
      value: envToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Login failed" },
      { status: 500 },
    );
  }
}
