import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Product from "@/lib/models/Product";
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

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const limit = searchParams.get("limit");

    let query: any = {};
    if (category) {
      query.category = category;
    }
    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    let mQuery = Product.find(query).sort({ createdAt: -1 });

    if (limit) {
      mQuery = mQuery.limit(parseInt(limit));
    }

    const products = await mQuery;
    const missingSlugs = products.filter(
      (product) => !product.slug && product.name,
    );

    if (missingSlugs.length > 0) {
      await Promise.all(
        missingSlugs.map(async (product) => {
          product.slug = await buildUniqueSlug(
            String(product.name || "product"),
            product._id.toString(),
          );
          await product.save();
        }),
      );
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
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
    if (!body?.slug && body?.name) {
      body.slug = await buildUniqueSlug(body.name);
    } else if (body?.slug) {
      body.slug = await buildUniqueSlug(body.slug);
    }

    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 },
    );
  }
}
