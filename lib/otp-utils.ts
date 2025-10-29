import { getDB } from './database';
import { v4 as uuidv4 } from 'uuid';

export interface OTPRecord {
  id: string;
  email: string;
  otp: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export async function generateAndStoreOtp(email: string): Promise<string> {
  const db = await getDB();
  
  // Clean up expired OTPs first
  await db.run(
    'DELETE FROM user_otps WHERE expiresAt < datetime("now") OR used = 1'
  );

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  const otpId = uuidv4();

  // Store OTP in database
  await db.run(
    'INSERT INTO user_otps (id, email, otp, expiresAt) VALUES (?, ?, ?, ?)',
    [otpId, email, otp, expiresAt.toISOString()]
  );
  
  console.log(`📧 OTP stored in database for ${email}: ${otp}`);
  return otp;
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
  const db = await getDB();
  
  try {
    // Find valid OTP
    const otpRecord = await db.get<OTPRecord>(
      `SELECT * FROM user_otps 
       WHERE email = ? AND otp = ? AND expiresAt > datetime("now") AND used = 0
       ORDER BY createdAt DESC LIMIT 1`,
      [email, otp]
    );

    console.log(`🔍 OTP lookup for ${email}:`, {
      found: !!otpRecord,
      providedOtp: otp,
      storedOtp: otpRecord?.otp,
      expiresAt: otpRecord?.expiresAt,
      used: otpRecord?.used
    });

    if (!otpRecord) {
      console.log(`❌ No valid OTP found for email: ${email}`);
      return false;
    }

    // Mark OTP as used
    await db.run(
      'UPDATE user_otps SET used = 1 WHERE id = ?',
      [otpRecord.id]
    );

    console.log(`✅ OTP verified successfully for ${email}`);
    return true;

  } catch (error) {
    console.error('❌ OTP verification error:', error);
    return false;
  }
}

export async function cleanupExpiredOtps(): Promise<void> {
  const db = await getDB();
  try {
    await db.run('DELETE FROM user_otps WHERE expiresAt < datetime("now") OR used = 1');
    console.log('🧹 Cleaned up expired OTPs');
  } catch (error) {
    console.error('Error cleaning up OTPs:', error);
  }
}