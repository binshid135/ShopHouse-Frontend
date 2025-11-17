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
    // console.log(`📧 OTP for ${email}: ${otp} (Resend not configured - check RESEND_API_KEY)`);
    return false;
  }

  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    const { data, error } = await resend.emails.send({
      from: 'ShopHouse <noreply@shophousealain.com>',
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
      from: 'ShopHouse <noreply@shophousealain.com>',
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

// Add to lib/email.ts
export async function sendNewOrderNotification(orderData: any): Promise<boolean> {
  const resend = getResendClient();
  
  if (!resend) {
    console.log('📧 Order notification (Resend not configured):', {
      orderId: orderData.id,
      total: orderData.total,
      customer: orderData.customerName
    });
    return false;
  }

  try {
    console.log(`📧 Attempting to send new order notification for order: ${orderData.id}`);
    
    const { data, error } = await resend.emails.send({
      from: 'ShopHouse <noreply@shophousealain.com>',
      to: ['shophouse2025@gmail.com'], // Only admin email
      subject: `🛍️ New Order Received - #${orderData.id.substring(0, 8)}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { text-align: center; margin-bottom: 30px; background: #e67e22; color: white; padding: 20px; border-radius: 8px; }
                .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .customer-info { background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .item { border-bottom: 1px solid #eee; padding: 10px 0; }
                .total { background: #2c3e50; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-top: 20px; }
                .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
                .status { display: inline-block; background: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">🛍️ ShopHouse</h1>
                    <p style="margin: 10px 0 0 0; opacity: 0.9;">New Order Notification</p>
                </div>
                
                <h2 style="color: #333;">New Order Received!</h2>
                <p>A new order has been placed on ShopHouse.</p>
                
                <div class="order-info">
                    <h3 style="margin-top: 0;">Order Details</h3>
                    <p><strong>Order ID:</strong> ${orderData.id}</p>
                    <p><strong>Order Date:</strong> ${new Date().toLocaleString()}</p>
                    <p><strong>Status:</strong> <span class="status">${orderData.status}</span></p>
                    <p><strong>Items:</strong> ${orderData.itemCount} items</p>
                </div>
                
                <div class="customer-info">
                    <h3 style="margin-top: 0;">Customer Information</h3>
                    <p><strong>Name:</strong> ${orderData.customerName}</p>
                    <p><strong>Phone:</strong> ${orderData.customerPhone}</p>
                    <p><strong>Email:</strong> ${orderData.customerEmail || 'Not provided'}</p>
                    <p><strong>Shipping Address:</strong><br>${orderData.shippingAddress.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div class="total">
                  <h3 style="margin: 0; color: white;">Total Amount: AED ${orderData.total.toFixed(2)}</h3>
                </div>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/admin/orders" 
                     style="background: #e67e22; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    View Order in Admin Panel
                  </a>
                </div>
                
                <div class="footer">
                  <p>This is an automated notification from ShopHouse Order System.</p>
                  <p style="font-size: 12px; color: #999;">
                    Order ID: ${orderData.id}<br>
                    Received: ${new Date().toLocaleString()}
                  </p>
                </div>
            </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('❌ Resend API error for order notification:', error);
      return false;
    }

    console.log('✅ New order notification sent to admin successfully. Email ID:', data?.id);
    return true;
  } catch (error) {
    console.error('❌ Failed to send new order notification:', error);
    return false;
  }
}