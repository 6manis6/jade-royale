import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = searchParams.get("limit");

    const query: any = {};
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
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
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
      !body.customer.address
    ) {
      return NextResponse.json(
        { success: false, error: "Incomplete customer information" },
        { status: 400 },
      );
    }

    const order = await Order.create(body);

    // Optional: Here we could clear cart or reduce product stock

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
