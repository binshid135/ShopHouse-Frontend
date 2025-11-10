// lib/otp-utils.ts
import { query } from './neon';
import { v4 as uuidv4 } from 'uuid';
import { sendOtpEmail } from './email';

export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export async function generateAndStoreOtp(email: string): Promise<string> {
  try {
    // Clean up expired OTPs first
    await cleanupExpiredOtps();

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in database
    await query(
      'INSERT INTO user_otps (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt.toISOString()]
    );
    
    console.log(`📧 OTP stored in database for ${email}`);
    
    // Send OTP via email
    const emailSent = await sendOtpEmail(email, otp);
    
    if (emailSent) {
      console.log('✅ OTP email sent successfully');
    } else {
      console.log('⚠️  OTP email failed, but OTP was generated and stored');
      // You might want to implement a fallback (SMS, etc.) here
    }
    
    return otp;
  } catch (error: any) {
    console.error('❌ Failed to store OTP in database:', error.message);
    
    // Fallback: generate OTP but don't store it
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`📧 OTP for ${email}: ${otp} (not stored due to error)`);
    
    // Try to send email anyway
    await sendOtpEmail(email, otp);
    
    return otp;
  }
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  try {
    // Check if table exists first
    const tableExists = await checkOtpTableExists();
    
    if (!tableExists) {
      console.log(`🔍 DEVELOPMENT: OTP verification for ${email}: ${otp} (table missing, auto-verifying)`);
      return true; // Auto-verify in development when table doesn't exist
    }
    
    // Find valid OTP
    const result = await query(
      `SELECT * FROM user_otps 
       WHERE email = $1 AND otp = $2 AND expires_at > NOW() AND used = false
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    console.log(`🔍 OTP lookup for ${email}:`, {
      found: result.rows.length > 0,
      providedOtp: otp,
      storedOtp: result.rows[0]?.otp,
      expiresAt: result.rows[0]?.expires_at,
      used: result.rows[0]?.used
    });

    if (result.rows.length === 0) {
      console.log(`❌ No valid OTP found for email: ${email}`);
      return false;
    }

    const otpRecord = result.rows[0];

    // Mark OTP as used (important to prevent reuse)
    await query(
      'UPDATE user_otps SET used = true WHERE id = $1',
      [otpRecord.id]
    );

    console.log(`✅ OTP verified successfully for ${email}`);
    return true;

  } catch (error: any) {
    console.error('❌ OTP verification error:', error.message);
    
    // For development, allow any OTP if table doesn't exist
    if (error.message.includes('relation "user_otps" does not exist')) {
      console.log('⚠️  OTP table missing, allowing OTP for development');
      return true;
    }
    
    return false;
  }
}

// Helper function to check if OTP table exists
async function checkOtpTableExists(): Promise<boolean> {
  try {
    await query('SELECT 1 FROM user_otps LIMIT 1');
    return true;
  } catch (error: any) {
    if (error.message.includes('relation "user_otps" does not exist')) {
      return false;
    }
    throw error;
  }
}
export async function cleanupExpiredOtps(): Promise<void> {
  try {
    await query('DELETE FROM user_otps WHERE expires_at < NOW() OR used = true');
    console.log('🧹 Cleaned up expired OTPs');
  } catch (error: any) {
    // Silently fail if table doesn't exist
    if (!error.message.includes('relation "user_otps" does not exist')) {
      console.error('Error cleaning up OTPs:', error);
    }
  }
}