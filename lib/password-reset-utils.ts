import { getDB } from './database';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword } from './auth-user';

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const db = await getDB();
  
  // Clean up expired tokens first
  await db.run(
    'DELETE FROM password_reset_tokens WHERE expiresAt < datetime("now") OR used = 1'
  );

  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Store token in database
  await db.run(
    'INSERT INTO password_reset_tokens (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
    [uuidv4(), userId, token, expiresAt.toISOString()]
  );
  
  console.log(`🔐 Password reset token stored for user ${userId}: ${token}`);
  return token;
}

export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const db = await getDB();
  
  try {
    // Find valid token
    const tokenRecord = await db.get(
      `SELECT * FROM password_reset_tokens 
       WHERE token = ? AND expiresAt > datetime("now") AND used = 0
       ORDER BY createdAt DESC LIMIT 1`,
      [token]
    );

    console.log(`🔍 Password reset token lookup:`, {
      found: !!tokenRecord,
      token: token,
      expiresAt: tokenRecord?.expiresAt,
      used: tokenRecord?.used
    });

    if (!tokenRecord) {
      console.log(`❌ No valid password reset token found`);
      return null;
    }

    // Mark token as used
    await db.run(
      'UPDATE password_reset_tokens SET used = 1 WHERE id = ?',
      [tokenRecord.id]
    );

    console.log(`✅ Password reset token verified for user: ${tokenRecord.userId}`);
    return tokenRecord.userId;

  } catch (error) {
    console.error('❌ Password reset token verification error:', error);
    return null;
  }
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<void> {
  const db = await getDB();
  const hashedPassword = await hashPassword(newPassword);
  
  await db.run(
    'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
    [hashedPassword, new Date().toISOString(), userId]
  );
  
  console.log(`✅ Password updated for user: ${userId}`);
}

export async function cleanupExpiredPasswordTokens(): Promise<void> {
  const db = await getDB();
  try {
    await db.run('DELETE FROM password_reset_tokens WHERE expiresAt < datetime("now") OR used = 1');
    console.log('🧹 Cleaned up expired password reset tokens');
  } catch (error) {
    console.error('Error cleaning up password reset tokens:', error);
  }
}