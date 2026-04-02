import { NextResponse } from "next/server";
import { createHmac } from "crypto";
import connectToDatabase from "@/lib/mongodb";
import Order from "@/lib/models/Order";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import User from "@/lib/models/User";

const getBaseUrl = (request: Request) => {
  const origin = request.headers.get("origin");
  if (origin) return origin;

  const proto = request.headers.get("x-forwarded-proto") || "http";
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (!host) return "";
  return `${proto}://${host}`;
};

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    const session = await getServerSession(authOptions);
    let userId = null as string | null;
    if (session?.user?.email) {
      const userDoc = await User.findOne({ email: session.user.email });
      if (userDoc) {
        userId = userDoc._id.toString();
      }
    }

    const body = await request.json();
    const { items, customer, totalAmount } = body || {};

    if (!items || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No order items" },
        { status: 400 },
      );
    }

    if (!customer || !customer.name || !customer.phone || !customer.address) {
      return NextResponse.json(
        { success: false, error: "Incomplete customer information" },
        { status: 400 },
      );
    }

    const numericTotal = Number(totalAmount);
    if (!Number.isFinite(numericTotal) || numericTotal <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid total amount" },
        { status: 400 },
      );
    }

    const secretKey = process.env.ESEWA_SECRET_KEY || "";
    const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";
    const formUrl =
      process.env.ESEWA_FORM_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form";

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "eSewa secret key is not configured" },
        { status: 500 },
      );
    }

    const orderData = {
      items,
      customer,
      paymentMethod: "esewa",
      totalAmount: numericTotal,
      status: "Pending",
      ...(userId ? { userId } : {}),
    };

    const order = await Order.create(orderData);
    const transactionUuid = order._id.toString();

    const amountStr = numericTotal.toFixed(2);
    const totalAmountStr = amountStr;
    const signedFieldNames = "total_amount,transaction_uuid,product_code";
    const signatureBase = `total_amount=${totalAmountStr},transaction_uuid=${transactionUuid},product_code=${productCode}`;

    const signature = createHmac("sha256", secretKey)
      .update(signatureBase)
      .digest("base64");

    const baseUrl = getBaseUrl(request);
    const successUrl = `${baseUrl}/esewa/success`;
    const failureUrl = `${baseUrl}/esewa/failure`;

    const payload = {
      amount: amountStr,
      tax_amount: "0",
      product_service_charge: "0",
      product_delivery_charge: "0",
      total_amount: totalAmountStr,
      transaction_uuid: transactionUuid,
      product_code: productCode,
      success_url: successUrl,
      failure_url: failureUrl,
      signed_field_names: signedFieldNames,
      signature,
    };

    return NextResponse.json({
      success: true,
      data: { formUrl, payload, orderId: transactionUuid },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to init eSewa";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
