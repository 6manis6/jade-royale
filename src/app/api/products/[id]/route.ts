import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
import mongoose from "mongoose";
import { slugify } from "@/lib/slug";

const buildUniqueSlug = async (value: string, excludeId?: string) => {
  const base = slugify(value);
  let slug = base;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existing = await Product.findOne(query).select("_id");
    if (!existing) return slug;

    counter += 1;
    slug = `${base}-${counter}`;
  }
};

export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = await params; // Next.js 14 requires awaiting params or destructuring from it after awaiting

    await connectToDatabase();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const product = isObjectId
      ? await Product.findById(id)
      : await Product.findOne({ slug: id });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    if (!product.slug && product.name) {
      product.slug = await buildUniqueSlug(
        String(product.name || "product"),
        product._id.toString(),
      );
      await product.save();
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Product ID" },
        { status: 400 },
      );
    }

    const body = await request.json();
    if (body?.name && !body?.slug) {
      body.slug = await buildUniqueSlug(body.name, id);
    } else if (body?.slug) {
      body.slug = await buildUniqueSlug(body.slug, id);
    }
    const product = await Product.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = await params;

    await connectToDatabase();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid Product ID" },
        { status: 400 },
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
