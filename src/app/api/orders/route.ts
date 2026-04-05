import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/lib/models/User";
import { sendOrderEmails } from "@/lib/email";
import { verifyAndDecrementStock } from "@/lib/stock";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const query: Record<string, string> = {};
    if (status) {
      query.status = status;
    }

    let mQuery = Order.find(query).sort({ createdAt: -1 });
    if (limit) {
      mQuery = mQuery.limit(parseInt(limit));
    }

    const orders = await mQuery;
    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load orders",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    let userId = null;
    if (session?.user?.email) {
      const userDoc = await User.findOne({ email: session.user.email });
      if (userDoc) {
        userId = userDoc._id;
      }
    }

    const body = await request.json();

    // Basic validation
    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No order items" },
        { status: 400 },
      );
    }

    if (
      !body.customer ||
      !body.customer.name ||
      !body.customer.phone ||
      !body.customer.address ||
      !body.customer.city
    ) {
      return NextResponse.json(
        { success: false, error: "Incomplete customer information" },
        { status: 400 },
      );
    }

    if (body.paymentMethod !== "cod") {
      return NextResponse.json(
        { success: false, error: "Unsupported payment method" },
        { status: 400 },
      );
    }

    const stockResult = await verifyAndDecrementStock(body.items);
    if (!stockResult.success) {
      return NextResponse.json(
        { success: false, error: stockResult.error || "Stock unavailable" },
        { status: 409 },
      );
    }

    const orderData = { ...body };
    if (userId) {
      orderData.userId = userId;
    }

    const order = await Order.create(orderData);

    if (session?.user?.email) {
      try {
        await sendOrderEmails({
          orderId: order._id.toString(),
          customerName: body.customer.name,
          customerEmail: session.user.email,
          phone: body.customer.phone,
          address: body.customer.address,
          city: body.customer.city,
          totalAmount: order.totalAmount,
          items: (body.items || []).map((item: any) => ({
            name: String(item.name || ""),
            qty: Number(item.qty || 0),
            price: Number(item.price || 0),
          })),
        });
      } catch (emailError) {
        console.error("Order email failed", emailError);
      }
    }

    // Optional: Here we could clear cart or reduce product stock

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to create order",
      },
      { status: 500 },
    );
  }
}
