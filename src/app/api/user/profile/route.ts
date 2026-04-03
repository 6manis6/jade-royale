import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Order from "@/lib/models/Order";
import "@/lib/models/Product"; // Ensure Product model is registered for populate

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email }).populate(
      "wishlist",
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const orders = await Order.find({ userId: user._id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({
      success: true,
      data: {
        profile: {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          defaultShippingAddress: user.defaultShippingAddress || {
            address: "",
            city: "",
          },
        },
        wishlist: user.wishlist,
        orders: orders,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to load profile",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
    const address =
      typeof body?.address === "string" ? body.address.trim() : "";
    const city = typeof body?.city === "string" ? body.city.trim() : "";

    await connectToDatabase();

    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        phone,
        defaultShippingAddress: {
          address,
          city,
        },
      },
      { new: true },
    );

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        phone: user.phone || "",
        defaultShippingAddress: user.defaultShippingAddress || {
          address: "",
          city: "",
        },
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
