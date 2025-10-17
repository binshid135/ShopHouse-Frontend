// lib/auth.ts
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'admin123'
};

export async function verifyAdminCredentials(username: string, password: string) {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password;
}

export async function createAdminSession() {
  const token = jwt.sign(
    { username: ADMIN_CREDENTIALS.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  
  return token;
}

export async function verifyAdminSession() {
  const cookieStore = cookies();
  const token = (await cookieStore).get('admin-token')?.value;
  
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded.role === 'admin' ? decoded : null;
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  (await cookies()).delete('admin-token');
}