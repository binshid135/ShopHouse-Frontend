// lib/email.ts
import { Resend } from 'resend';

// Initialize Resend only when needed, not at module level
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.log('⚠️  RESEND_API_KEY not found in environment variables');
    return null;
  }
  
  try {
    const client = new Resend(process.env.RESEND_API_KEY);
    console.log('✅ Resend client initialized successfully');
    return client;
  } catch (error) {
    console.error('❌ Failed to initialize Resend client:', error);
    return null;
  }
}

export async function sendOtpEmail(email: string, otp: string): Promise<boolean> {
  const resend = getResendClient();
  
  // If Resend is not initialized, log and return false
  if (!resend) {
    console.log(`📧 OTP for ${email}: ${otp} (Resend not configured - check RESEND_API_KEY)`);
    return false;
  }

  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: 'ShopHouse <onboarding@resend.dev>',
      to: [email],
      subject: 'Your OTP Verification Code - ShopHouse',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .otp-code { background: #f8f9fa; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border-radius: 8px; color: #333; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; color: #856404; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="color: #e67e22; margin: 0;">ShopHouse</h1>
                    <p style="color: #666; margin: 10px 0 0 0;">Kitchen Equipment Store</p>
                </div>
                
                <h2 style="color: #333;">Email Verification</h2>
                <p>Hello,</p>
                <p>Thank you for registering with ShopHouse. Use the following OTP code to verify your email address:</p>
                
                <div class="otp-code">${otp}</div>
                
                <div class="warning">
                    <strong>Important:</strong> This OTP will expire in 10 minutes. Do not share this code with anyone.
                </div>
                
                <p>If you didn't request this verification, please ignore this email.</p>
                
                <div class="footer">
                    <p>Best regards,<br>The ShopHouse Team</p>
                    <p style="font-size: 12px; color: #999;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }

    console.log('✅ OTP email sent successfully. Email ID:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, resetLink: string): Promise<boolean> {
  const resend = getResendClient();
  
  // If Resend is not initialized, log and return false
  if (!resend) {
    console.log(`📧 Password reset link for ${email}: ${resetLink} (Resend not configured)`);
    return false;
  }

  try {
    console.log(`📧 Attempting to send password reset email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: 'ShopHouse <onboarding@resend.dev>',
      to: [email],
      subject: 'Reset Your Password - ShopHouse',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; }
                .button { display: inline-block; background: #e67e22; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                .warning { background: #fff3cd; padding: 10px; border-radius: 5px; margin: 20px 0; color: #856404; }
                .reset-link { word-break: break-all; background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; font-family: monospace; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="color: #e67e22; margin: 0;">ShopHouse</h1>
                    <p style="color: #666; margin: 10px 0 0 0;">Password Reset Request</p>
                </div>
                
                <h2 style="color: #333;">Reset Your Password</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your ShopHouse account.</p>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <div class="reset-link">${resetLink}</div>
                
                <div class="warning">
                    <strong>Important:</strong> This password reset link will expire in 1 hour.
                    If you didn't request a password reset, please ignore this email.
                </div>
                
                <div class="footer">
                    <p>Best regards,<br>The ShopHouse Team</p>
                    <p style="font-size: 12px; color: #999;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend API error:', error);
      return false;
    }

    console.log('✅ Password reset email sent successfully. Email ID:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
}

// Test function to verify Resend setup
export async function testEmailSetup(): Promise<boolean> {
  try {
    console.log('🧪 Testing Resend configuration...');
    
    const resend = getResendClient();
    if (!resend) {
      console.log('❌ Resend not configured. Please check RESEND_API_KEY in .env.local');
      console.log('💡 Current RESEND_API_KEY:', process.env.RESEND_API_KEY ? '***set***' : 'not set');
      return false;
    }
    
    // Use a test email - replace with your actual email for testing
    const testEmail = 'ahmedbinshid@gmail.com'; // ⚠️ CHANGE THIS TO YOUR REAL EMAIL
    const testOtp = '123456';
    
    console.log(`📧 Sending test email to: ${testEmail}`);
    const result = await sendOtpEmail(testEmail, testOtp);
    
    if (result) {
      console.log('✅ Resend configuration test: PASSED');
      console.log('📩 Check your email inbox for the test OTP');
    } else {
      console.log('❌ Resend configuration test: FAILED');
      console.log('💡 Check your RESEND_API_KEY and try again');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Resend test failed:', error);
    return false;
  }
}