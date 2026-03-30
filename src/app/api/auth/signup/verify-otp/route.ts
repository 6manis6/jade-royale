import { NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import SignupOtp from "@/lib/models/SignupOtp";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, error: "Email and OTP are required." },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    await connectToDatabase();

    const pending = await SignupOtp.findOne({ email: normalizedEmail });
    if (!pending) {
      return NextResponse.json(
        { success: false, error: "No OTP request found for this email." },
        { status: 404 },
      );
    }

    if (pending.expiresAt.getTime() < Date.now()) {
      await SignupOtp.deleteOne({ _id: pending._id });
      return NextResponse.json(
        { success: false, error: "OTP expired. Please request a new OTP." },
        { status: 400 },
      );
    }

    const otpHash = crypto
      .createHash("sha256")
      .update(String(otp).trim())
      .digest("hex");
    if (otpHash !== pending.otpHash) {
      return NextResponse.json(
        { success: false, error: "Invalid OTP." },
        { status: 400 },
      );
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.emailVerified) {
      await SignupOtp.deleteOne({ _id: pending._id });
      return NextResponse.json(
        { success: false, error: "Account already exists. Please login." },
        { status: 409 },
      );
    }

    if (!existingUser) {
      await User.create({
        name: pending.name,
        email: normalizedEmail,
        passwordHash: pending.passwordHash,
        provider: "credentials",
        emailVerified: true,
      });
    } else {
      existingUser.name = pending.name;
      existingUser.passwordHash = pending.passwordHash;
      existingUser.provider = "credentials";
      existingUser.emailVerified = true;
      await existingUser.save();
    }

    await SignupOtp.deleteOne({ _id: pending._id });

    return NextResponse.json({
      success: true,
      message: "Account verified and created successfully.",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "OTP verification failed.";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
