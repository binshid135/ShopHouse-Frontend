import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, destroyAdminSession, verifyAdminSession } from './../../../../lib/auth';
import { query } from './../../../../lib/neon';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    const isValid = await verifyAdminCredentials(username, password);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const token = await createAdminSession();
    const response = NextResponse.json({ success: true });
    
    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 600 // 24 hours
    });
    
    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await destroyAdminSession();
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return response;
  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await verifyAdminSession();
    return NextResponse.json({ authenticated: !!session });
  } catch (error) {
    console.error('Admin session check error:', error);
    return NextResponse.json({ authenticated: false });
  }
}