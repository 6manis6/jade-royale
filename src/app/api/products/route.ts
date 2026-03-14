import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    
    // Parse query params for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const q = searchParams.get('q');
    const limit = searchParams.get('limit');
    
    let query: any = {};
    if (category) {
      query.category = category;
    }
    if (q) {
      query.name = { $regex: q, $options: 'i' };
    }

    let mQuery = Product.find(query).sort({ createdAt: -1 });
    
    if (limit) {
      mQuery = mQuery.limit(parseInt(limit));
    }

    const products = await mQuery;
    return NextResponse.json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const product = await Product.create(body);
    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
