import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import User from "@/lib/models/User";
import { sendOrderEmails } from "@/lib/email";

const buildSignatureMessage = (
  signedFieldNames: string,
  payload: Record<string, unknown>,
) => {
  return signedFieldNames
    .split(",")
    .map((name) => `${name}=${String(payload[name] ?? "")}`)
    .join(",");
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get("data");

    if (!data) {
      return NextResponse.json(
        { success: false, error: "Missing eSewa response data" },
        { status: 400 },
      );
    }

    const secretKey = process.env.ESEWA_SECRET_KEY || "";
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "eSewa secret key is not configured" },
        { status: 500 },
      );
    }

    const decoded = Buffer.from(data, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded) as unknown;
    if (!isRecord(parsed)) {
      return NextResponse.json(
        { success: false, error: "Invalid eSewa response" },
        { status: 400 },
      );
    }
    const payload = parsed;

    const signedFieldNames = String(payload.signed_field_names || "");
    if (!signedFieldNames) {
      return NextResponse.json(
        { success: false, error: "Missing signed fields" },
        { status: 400 },
      );
    }

    const signatureBase = buildSignatureMessage(signedFieldNames, payload);
    const expectedSignature = createHmac("sha256", secretKey)
      .update(signatureBase)
      .digest("base64");

    if (expectedSignature !== String(payload.signature || "")) {
      return NextResponse.json(
        { success: false, error: "Invalid eSewa signature" },
        { status: 400 },
      );
    }

    if (String(payload.product_code || "") !== productCode) {
      return NextResponse.json(
        { success: false, error: "Invalid product code" },
        { status: 400 },
      );
    }

    const transactionUuid = String(payload.transaction_uuid || "");
    if (!transactionUuid) {
      return NextResponse.json(
        { success: false, error: "Missing transaction ID" },
        { status: 400 },
      );
    }

    if (String(payload.status || "") !== "COMPLETE") {
      return NextResponse.json({
        success: false,
        error: "Payment not completed",
        status: String(payload.status || ""),
      });
    }

    await connectToDatabase();
    const order = await Order.findByIdAndUpdate(
      transactionUuid,
      { status: "Paid" },
      { new: true },
    );

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    if (order.userId) {
      try {
        const user = await User.findById(order.userId);
        if (user?.email) {
          await sendOrderEmails({
            orderId: order._id.toString(),
            customerName: order.customer?.name || user.name || "",
            customerEmail: user.email,
            phone: order.customer?.phone || user.phone || "",
            address: order.customer?.address || "",
            city: order.customer?.city || "",
            totalAmount: order.totalAmount,
            items: (order.items || []).map(
              (item: { name?: unknown; qty?: unknown; price?: unknown }) => ({
                name: String(item.name || ""),
                qty: Number(item.qty || 0),
                price: Number(item.price || 0),
              }),
            ),
          });
        }
      } catch (emailError) {
        console.error("Order email failed", emailError);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        status: String(payload.status || ""),
      },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to verify eSewa";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
