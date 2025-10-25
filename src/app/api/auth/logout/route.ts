import { NextRequest, NextResponse } from 'next/server';
import { deleteUserSession } from '../../../../../lib/auth-user';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('userToken')?.value;

    if (token) {
      await deleteUserSession(token);
    }

    const response = NextResponse.json({ success: true });
    
    // Clear session cookie
    response.cookies.set('userToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}