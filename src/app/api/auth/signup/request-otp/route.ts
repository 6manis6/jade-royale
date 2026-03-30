import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import SignupOtp from "@/lib/models/SignupOtp";
import { sendSignupOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: "Name, email, and password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    await connectToDatabase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
      emailVerified: true,
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "Email already registered. Please login." },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await SignupOtp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        name: String(name).trim(),
        email: normalizedEmail,
        passwordHash,
        otpHash,
        expiresAt,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await sendSignupOtpEmail(normalizedEmail, otp, String(name).trim());

    return NextResponse.json({
      success: true,
      message: "OTP sent to your email.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send OTP.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
