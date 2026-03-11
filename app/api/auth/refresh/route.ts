import { NextRequest, NextResponse } from 'next/server';
import { verifyRefreshToken, generateTokens, setTokenCookies } from '@/lib/auth/jwt';
import connectDB from '@/lib/db/connect';
import Admin from '@/lib/db/models/Admin';
import Cafe from '@/lib/db/models/Cafe';

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refreshToken')?.value || 
                        (await req.json()).refreshToken;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'Refresh token required' },
        { status: 401 }
      );
    }

    const user = verifyRefreshToken(refreshToken);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid refresh token' },
        { status: 401 }
      );
    }

    await connectDB();
    let tokenVersion = 0;
    if (user.role === 'superadmin') {
      const admin = await Admin.findById(user.id);
      if (!admin) {
        return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
      }
      tokenVersion = admin.tokenVersion ?? 0;
    } else if (user.role === 'cafeadmin') {
      // Try Admin first (preferred)
      const admin = await Admin.findById(user.id);
      if (admin) {
        tokenVersion = admin.tokenVersion ?? 0;
      } else {
        const cafe = await Cafe.findOne({ username: user.username });
        if (!cafe) {
          return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }
        tokenVersion = cafe.tokenVersion ?? 0;
      }
    }

    // If refresh token's tokenVersion mismatches DB, reject
    if ((user as any).tokenVersion !== undefined && (user as any).tokenVersion !== tokenVersion) {
      return NextResponse.json(
        { success: false, message: 'Session invalidated. Please login again.' },
        { status: 401 }
      );
    }

    // Generate new tokens with current DB tokenVersion
    const { token, refreshToken: newRefreshToken } = generateTokens({
      id: user.id,
      username: user.username,
      role: user.role,
      cafeSlug: user.cafeSlug,
      tokenVersion,
    });

    // Set new cookies
    setTokenCookies(token, newRefreshToken);

    return NextResponse.json({
      success: true,
      token,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
