import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSession } from '../../../../../lib/auth-user';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('userToken')?.value;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const user = await verifyUserSession(token);

    if (!user) {
      const response = NextResponse.json({ user: null });
      response.cookies.set('userToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
      });
      return response;
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ user: null });
  }
}