import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/lib/models/Order';

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    
    // Basic validation
    if (!body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'No order items' }, { status: 400 });
    }

    if (!body.customer || !body.customer.name || !body.customer.phone || !body.customer.address) {
      return NextResponse.json({ success: false, error: 'Incomplete customer information' }, { status: 400 });
    }

    const order = await Order.create(body);
    
    // Optional: Here we could clear cart or reduce product stock
    
    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
