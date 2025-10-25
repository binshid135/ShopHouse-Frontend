import { getDB } from './database';
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
  const db = await getDB();
  const token = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  
  await db.run(
    'INSERT INTO user_sessions (id, userId, token, expiresAt) VALUES (?, ?, ?, ?)',
    [uuidv4(), userId, token, expiresAt.toISOString()]
  );
  
  return token;
}

export async function verifyUserSession(token: string): Promise<User | null> {
  const db = await getDB();
  
  try {
    const session = await db.get(
      `SELECT us.*, u.* 
       FROM user_sessions us 
       JOIN users u ON us.userId = u.id 
       WHERE us.token = ? AND us.expiresAt > datetime('now')`,
      [token]
    );
    
    if (!session) {
      return null;
    }
    
    return {
      id: session.userId,
      email: session.email,
      name: session.name,
      phone: session.phone,
      address: session.address,
      role: session.role || 'customer',
      isActive: session.isActive !== 0,
      createdAt: session.createdAt
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

export async function deleteUserSession(token: string): Promise<void> {
  const db = await getDB();
  await db.run('DELETE FROM user_sessions WHERE token = ?', [token]);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const db = await getDB();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role || 'customer',
      isActive: user.isActive !== 0,
      createdAt: user.createdAt
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
  const db = await getDB();
  const userId = uuidv4();
  const hashedPassword = await hashPassword(userData.password);
  
  try {
    await db.run(
      `INSERT INTO users (id, email, name, password, phone, address, role, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userData.email,
        userData.name,
        hashedPassword,
        userData.phone || null,
        userData.address || null,
        'customer',
        1,
        new Date().toISOString(),
        new Date().toISOString()
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
  const db = await getDB();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!user) return null;
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      address: user.address,
      role: user.role || 'customer',
      isActive: user.isActive !== 0,
      createdAt: user.createdAt,
      password: user.password
    };
  } catch (error) {
    console.error('Get user with password error:', error);
    return null;
  }
}