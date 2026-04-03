import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import mongoose from "mongoose";

const allowedStatuses = [
  "Pending",
  "Processing",
  "Paid",
  "Shipped",
  "Delivered",
  "Cancelled",
] as const;

type OrderStatus = (typeof allowedStatuses)[number];

const isValidStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" &&
  (allowedStatuses as readonly string[]).includes(value);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Order ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    if (!isValidStatus(body?.status)) {
      return NextResponse.json(
        { success: false, error: "Invalid order status" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true, runValidators: true },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Order ID" },
        { status: 400 },
      );
    }

    const order = await Order.findByIdAndDelete(id);

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
