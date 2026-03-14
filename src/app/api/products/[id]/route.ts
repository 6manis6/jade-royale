import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/lib/models/Product';
import mongoose from 'mongoose';

export async function GET(request: Request, context: any) {
  try {
    const { params } = context;
    const { id } = await params; // Next.js 14 requires awaiting params or destructuring from it after awaiting

    await connectToDatabase();
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid Product ID' }, { status: 400 });
    }

    const product = await Product.findById(id);
    
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
