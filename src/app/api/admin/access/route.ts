import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

const getSuperuserEmail = () =>
  process.env.ADMIN_SUPERUSER_EMAIL?.toLowerCase() || "";

const isSuperuserEmail = (email: string) =>
  !!email && email.toLowerCase() === getSuperuserEmail();

export async function GET() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  await connectToDatabase();
  const user = await User.findOne({ email }).select("isAdmin");

  const isSuperuser = isSuperuserEmail(email);
  const isAdmin = isSuperuser || Boolean(user?.isAdmin);

  if (!isSuperuser) {
    return NextResponse.json({ success: true, isAdmin, isSuperuser });
  }

  const adminUsers = await User.find({
    isAdmin: true,
    email: { $ne: getSuperuserEmail() },
  })
    .select("email name")
    .sort({ email: 1 })
    .lean();

  return NextResponse.json({
    success: true,
    isAdmin,
    isSuperuser,
    superuserEmail: getSuperuserEmail(),
    adminUsers,
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();

  if (!email) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  if (!isSuperuserEmail(email)) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const targetEmail =
    typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const action = body?.action;

  if (!targetEmail) {
    return NextResponse.json(
      { success: false, error: "Email is required" },
      { status: 400 },
    );
  }

  if (targetEmail === getSuperuserEmail()) {
    return NextResponse.json(
      { success: false, error: "Cannot modify superuser access" },
      { status: 400 },
    );
  }

  if (action !== "grant" && action !== "revoke") {
    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 },
    );
  }

  await connectToDatabase();
  const user = await User.findOne({ email: targetEmail });

  if (!user) {
    return NextResponse.json(
      { success: false, error: "User not found" },
      { status: 404 },
    );
  }

  user.isAdmin = action === "grant";
  await user.save();

  return NextResponse.json({
    success: true,
    data: { email: user.email, isAdmin: user.isAdmin },
  });
}
