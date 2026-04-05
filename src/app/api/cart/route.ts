import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";

type CartItem = {
  productId: string;
  slug?: string;
  name: string;
  price: number;
  qty: number;
  image: string;
  stock?: number;
  variantLabel?: string;
};

type CartResponse = {
  success: boolean;
  data?: { items: CartItem[] };
  error?: string;
};

const getBaseProductId = (productId: string) => productId.split("-")[0];
const normalizeLabel = (value?: string) => value?.trim().toLowerCase();
type VariantLike = { colorName?: string; shadeName?: string; stock?: number };

const findVariantStock = (
  variants: VariantLike[] | undefined,
  label?: string,
) => {
  const normalized = normalizeLabel(label);
  if (!normalized || !variants?.length) return undefined;
  const match = variants.find(
    (variant) =>
      normalizeLabel(variant.shadeName) === normalized ||
      normalizeLabel(variant.colorName) === normalized,
  );
  return match?.stock;
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

    const rawItems = Array.isArray(user.cart) ? user.cart : [];
    const baseIds = rawItems
      .map((item) => getBaseProductId(String(item.productId)))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const products = await Product.find(
      { _id: { $in: baseIds } },
      "stock variants variantType slug",
    );
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const items = rawItems.map((item) => {
      const baseId = getBaseProductId(String(item.productId));
      const product = productMap.get(baseId);
      const label = normalizeLabel(String(item.variantLabel || ""));
      const variantStock = findVariantStock(
        product?.variants as VariantLike[] | undefined,
        label,
      );
      const stock =
        typeof variantStock === "number" ? variantStock : product?.stock;
      return {
        productId: String(item.productId),
        slug: product?.slug ? String(product.slug) : undefined,
        name: String(item.name),
        price: Number(item.price),
        qty: Number(item.qty),
        image: String(item.image),
        stock,
        variantLabel: item.variantLabel ? String(item.variantLabel) : undefined,
      };
    });

    return NextResponse.json<CartResponse>({
      success: true,
      data: { items },
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
      variantLabel: item.variantLabel ? String(item.variantLabel) : undefined,
    }));

    const baseIds = sanitizedItems
      .map((item) => getBaseProductId(item.productId))
      .filter((id) => mongoose.Types.ObjectId.isValid(id));
    const products = await Product.find(
      { _id: { $in: baseIds } },
      "stock variants variantType slug",
    );
    const productMap = new Map(
      products.map((product) => [product._id.toString(), product]),
    );
    const cappedItems = sanitizedItems
      .map((item) => {
        const baseId = getBaseProductId(item.productId);
        const product = productMap.get(baseId);
        const label = normalizeLabel(item.variantLabel);
        const variantStock = findVariantStock(
          product?.variants as VariantLike[] | undefined,
          label,
        );
        const stock =
          typeof variantStock === "number" ? variantStock : product?.stock;
        if (typeof stock !== "number") return item;
        const cappedQty = Math.min(item.qty, Math.max(0, stock));
        return {
          ...item,
          qty: cappedQty,
          stock,
          slug: product?.slug ? String(product.slug) : undefined,
        };
      })
      .filter((item) => item.qty > 0);

    user.set(
      "cart",
      cappedItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        image: item.image,
        variantLabel: item.variantLabel,
      })),
    );
    await user.save();

    return NextResponse.json<CartResponse>({
      success: true,
      data: { items: cappedItems },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json<CartResponse>(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
