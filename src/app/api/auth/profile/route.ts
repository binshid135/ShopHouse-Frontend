import { NextRequest, NextResponse } from 'next/server';
import { verifyUserSession } from '../../../../../lib/auth-user';

export async function GET(request: NextRequest) {
  try {
    // Verify user session
    const token = request.cookies.get('userToken')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await verifyUserSession(token);
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Return user profile (excluding sensitive data)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}