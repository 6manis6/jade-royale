import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Settings from '@/lib/models/Settings';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    if (!key) return NextResponse.json({ success: false, error: 'Key required' }, { status: 400 });
    
    const setting = await Settings.findOne({ key });
    return NextResponse.json({ success: true, data: setting?.value });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { key, value } = body;
    
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    );
    
    return NextResponse.json({ success: true, data: setting });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
