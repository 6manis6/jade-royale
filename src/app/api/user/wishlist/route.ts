import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Add to wishlist if not already present
    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Added to wishlist" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ success: false, error: "Product ID required" }, { status: 400 });
    }

    await connectToDatabase();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id: any) => id.toString() !== productId);
    await user.save();

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
