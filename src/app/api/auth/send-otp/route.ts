import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '../../../../../lib/auth-user';
import { generateAndStoreOtp, cleanupExpiredOtps } from '../../../../../lib/otp-utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Clean up expired OTPs first
    await cleanupExpiredOtps();

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Generate and store OTP in database
    const otp = await generateAndStoreOtp(email);

    // In production, you would send this via email service
    console.log(`📧 OTP for ${email}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      // Remove otp in production, only for development
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}