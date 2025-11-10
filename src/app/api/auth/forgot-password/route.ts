// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '../../../../../lib/auth-user';
import { generatePasswordResetToken } from '../../../../../lib/password-reset-utils';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log(`🔐 Password reset requested for: ${email}`);

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal whether user exists for security
      console.log(`⚠️  Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, reset instructions have been sent.'
      });
    }

    // Generate reset token and send email
    await generatePasswordResetToken(user.id, user.email);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, reset instructions have been sent.'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}