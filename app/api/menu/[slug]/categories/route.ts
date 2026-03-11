import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import MenuItem from '@/lib/db/models/MenuItem';

export const GET = async (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => {
  try {
    await connectDB();
    // Aggregate distinct categories with a representative image
    const results = await (MenuItem as any).aggregate([
      { $match: { cafeSlug: params.slug } },
      { $sort: { category: 1, name: 1 } },
      {
        $group: {
          _id: '$category',
          image: { $first: '$imageUrl' },
        },
      },
      { $project: { _id: 0, name: '$_id', image: 1 } },
      { $sort: { name: 1 } },
    ]);

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
};
