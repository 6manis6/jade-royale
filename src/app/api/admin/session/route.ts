import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "admin_auth";

export async function GET() {
  const envToken = process.env.ADMIN_PANEL_TOKEN;
  if (!envToken) {
    return NextResponse.json({ success: false, authenticated: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const authenticated = token === envToken;

  return NextResponse.json({ success: true, authenticated });
}
