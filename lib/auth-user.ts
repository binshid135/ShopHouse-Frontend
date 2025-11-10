import { query } from './neon';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUserSession(userId: string): Promise<string> {
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await query(
    'INSERT INTO user_sessions (id, user_id, token, expires_at) VALUES (gen_random_uuid(), $1, $2, $3)',
    [userId, token, expiresAt.toISOString()]
  );
  
  return token;
}

export async function verifyUserSession(token: string): Promise<User | null> {
  try {
    const result = await query(
      `SELECT us.*, u.* 
       FROM user_sessions us 
       JOIN users u ON us.user_id = u.id 
       WHERE us.token = $1 AND us.expires_at > NOW()`,
      [token]
    );
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const session = result.rows[0];
    
    return {
      id: session.user_id,
      email: session.email,
      name: session.name,
      phone: session.phone,
      address: session.address,
      role: session.role || 'customer',
      isActive: session.is_active !== false,
      createdAt: session.created_at
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function deleteUserSession(token: string): Promise<void> {
  await query('DELETE FROM user_sessions WHERE token = $1', [token]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role || 'customer',
      isActive: user.is_active !== false,
      createdAt: user.created_at
    };
  } catch (error) {
    console.error('Get user by email error:', error);
    return null;
  }
}

export async function createUser(userData: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}): Promise<User> {
  const userId = uuidv4();
  const hashedPassword = await hashPassword(userData.password);
  
  try {
    await query(
      `INSERT INTO users (id, email, name, password, phone, address, role, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        userId,
        userData.email,
        userData.name,
        hashedPassword,
        userData.phone || null,
        userData.address || null,
        'customer',
        true
      ]
    );
    
    return {
      id: userId,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: 'customer',
      isActive: true,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Create user error:', error);
    throw error;
  }
}

export async function getUserWithPassword(email: string): Promise<(User & { password: string }) | null> {
  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) return null;
    
    const user = result.rows[0];
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role || 'customer',
      isActive: user.is_active !== false,
      createdAt: user.created_at,
      password: user.password
    };
  } catch (error) {
    console.error('Get user with password error:', error);
    return null;
  }
}