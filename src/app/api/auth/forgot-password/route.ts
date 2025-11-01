import { NextRequest, NextResponse } from 'next/server';
import { getUserByEmail } from '../../../../../lib/auth-user';
import { generatePasswordResetToken } from '../../../../../lib/password-reset-utils.ts';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // Don't reveal whether user exists for security
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, reset instructions have been sent.'
      });
    }

    // Generate reset token
    const resetToken = await generatePasswordResetToken(user.id);

    // In production, you would send this via email
    // For development, we'll log it and return in response
    const resetLink = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    
    console.log(`🔐 Password reset link for ${email}: ${resetLink}`);

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, reset instructions have been sent.',
      // Remove in production, only for development
      resetLink: process.env.NODE_ENV === 'development' ? resetLink : undefined
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}