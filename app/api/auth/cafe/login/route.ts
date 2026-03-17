import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';
import { generateTokens, setTokenCookies } from '@/lib/auth/jwt';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, message: validation.error.issues?.[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { username, password } = validation.data;

    // Industry Standard: Always authenticate cafe admins against the Admin collection
    const admin = await Admin.findOne({ 
      username, 
      role: 'cafeadmin' 
    });

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials or not a cafe admin' },
        { status: 401 }
      );
    }

    // Verify password for the admin user
    const isValid = await admin.comparePassword(password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Ensure the admin is linked to a cafe
    if (!admin.cafeSlug) {
      return NextResponse.json(
        { success: false, message: 'Admin account not linked to a cafe' },
        { status: 403 } // Forbidden
      );
    }

    // Get cafe details for the response payload
    const cafe = await Cafe.findOne({ slug: admin.cafeSlug });

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: `Cafe with slug '${admin.cafeSlug}' not found` },
        { status: 404 }
      );
    }

    // Generate tokens
    const { token, refreshToken } = generateTokens({
      id: admin._id.toString(),
      username: admin.username,
      role: 'cafeadmin',
      cafeSlug: cafe.slug,
      tokenVersion: admin.tokenVersion ?? 0,
    });

    setTokenCookies(token, refreshToken);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      refreshToken,
      user: {
        id: admin._id,
        username: admin.username,
        role: admin.role,
        cafeSlug: cafe.slug,
        cafeName: cafe.cafeName,
      },
    });
  } catch (error) {
    console.error('Cafe login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
