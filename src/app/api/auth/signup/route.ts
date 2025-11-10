// app/api/auth/signup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByEmail, createUserSession } from '../../../../../lib/auth-user';
import { verifyOtp } from '../../../../../lib/otp-utils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, phone, otp } = await request.json();

    console.log('🔍 Signup request data:', { email, name, phone, otp });

    // Validation
    if (!email || !password || !name || !otp) {
      console.log('❌ Missing required fields:', { 
        email: !!email, 
        name: !!name, 
        password: !!password,
        otp: !!otp 
      });
      return NextResponse.json(
        { error: 'Email, password, name, and OTP are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      console.log('❌ Password too short:', password.length);
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // ✅ Check if user already exists FIRST (before OTP verification)
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      console.log('❌ User already exists:', email);
      return NextResponse.json(
        { error: 'User with this email already exists. Please login instead.' },
        { status: 409 }
      );
    }

    // ✅ Verify OTP BEFORE creating user
    const isOtpValid = await verifyOtp(email, otp);
    console.log(`🔍 OTP validation result for ${email}:`, isOtpValid);

    if (!isOtpValid) {
      console.log('❌ OTP verification failed for:', email);
      return NextResponse.json(
        { error: 'Invalid or expired OTP. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // ✅ Only create user AFTER OTP is verified
    console.log('✅ OTP verified, creating user:', email);
    const user = await createUser({ 
      email, 
      password, 
      name, 
      phone: phone || null 
    });
    
    // Create session
    const token = await createUserSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role
      }
    });

    // Set session cookie
    response.cookies.set('userToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    console.log('✅ User created successfully:', user.email);
    return response;

  } catch (error: any) {
    console.error('❌ Signup error:', error);
    
    // Handle specific database errors
    if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'User with this email already exists. Please login instead.' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}