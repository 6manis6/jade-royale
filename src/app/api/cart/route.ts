import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  qty: number;
  image: string;
};

type CartResponse = {
  success: boolean;
  data?: { items: CartItem[] };
  error?: string;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json<CartResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json<CartResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json<CartResponse>({
      success: true,
      data: { items: user.cart || [] },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json<CartResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json<CartResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as { items?: CartItem[] };
    const items = Array.isArray(body.items) ? body.items : [];

    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json<CartResponse>(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const sanitizedItems = items.map((item) => ({
      productId: String(item.productId),
      name: String(item.name),
      price: Number(item.price),
      qty: Math.max(1, Number(item.qty)),
      image: String(item.image),
    }));
    user.set("cart", sanitizedItems);
    await user.save();

    return NextResponse.json<CartResponse>({
      success: true,
      data: { items: user.cart || [] },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json<CartResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
