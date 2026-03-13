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

    // First check if it's a cafe admin in Admin collection
    let admin = await Admin.findOne({ 
      username, 
      role: 'cafeadmin' 
    });

    // If not found in Admin, check Cafe collection (for backward compatibility)
    if (!admin) {
      const cafe = await Cafe.findOne({ username });

      if (!cafe) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check if password matches (hashed in Cafe model)
      const cafeValid = await import('bcryptjs').then(m => m.default.compare(password, cafe.password));
      if (!cafeValid) {
        return NextResponse.json(
          { success: false, message: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate tokens for cafe
      const { token, refreshToken } = generateTokens({
        id: cafe._id.toString(),
        username: cafe.username,
        role: 'cafeadmin',
        cafeSlug: cafe.slug,
        tokenVersion: cafe.tokenVersion ?? 0,
      });

      setTokenCookies(token, refreshToken);

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        refreshToken,
        user: {
          id: cafe._id,
          username: cafe.username,
          role: 'cafeadmin',
          cafeSlug: cafe.slug,
          cafeName: cafe.cafeName,
        },
      });
    }

    // Verify password for Admin user
    let isValid = await admin.comparePassword(password);

    // Fallback migration path: if Admin compare fails, try Cafe password (handles historical double-hash issue)
    if (!isValid) {
      const cafeForMigration = await Cafe.findOne({ username: admin.username });
      if (cafeForMigration) {
        const cafeValid = await import('bcryptjs').then(m => m.default.compare(password, cafeForMigration.password));
        if (cafeValid) {
          // Migrate admin password to correct hash based on provided password
          admin.password = password; // pre-save hook will hash
          await admin.save();
          isValid = true;
        }
      }
    }

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Get cafe details
    const cafe = await Cafe.findOne({ slug: admin.cafeSlug });

    if (!cafe) {
      return NextResponse.json(
        { success: false, message: 'Cafe not found' },
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
