// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, createAdminSession, destroyAdminSession, verifyAdminSession } from './../../../../lib/auth';

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
      maxAge: 86400 // 24 hours
    });
    
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

export async function DELETE() {
  await destroyAdminSession();
  return NextResponse.json({ success: true });
}

export async function GET() {
  const session = await verifyAdminSession();
  return NextResponse.json({ authenticated: !!session });
}