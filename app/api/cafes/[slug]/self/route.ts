import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Cafe from '@/lib/db/models/Cafe';
import { withCafeAccess } from '@/lib/auth/middleware';
import { AuthRequest } from '@/lib/auth/middleware';

// Get cafe details for cafe admin
export const GET = withCafeAccess(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();
    const cafe = await Cafe.findOne({ slug: params.slug });
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: cafe });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});

// Update limited cafe details for cafe admin
export const PUT = withCafeAccess(async (req: AuthRequest, { params }: { params: { slug: string } }) => {
  try {
    await connectDB();
    const body = await req.json();
    // Only allow updating these fields for cafe admins
    const allowedFields = ['ownerName', 'email', 'city', 'location'];
    const update: Record<string, any> = {};
    for (const key of allowedFields) {
      if (key in body) update[key] = body[key];
    }
    const cafe = await Cafe.findOneAndUpdate(
      { slug: params.slug },
      update,
      { new: true, runValidators: true }
    );
    if (!cafe) {
      return NextResponse.json({ success: false, message: 'Cafe not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Changes saved', data: cafe });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
});
