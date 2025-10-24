// lib/database.ts
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { Product, User, Order, Coupon } from './types';

let db: any = null;

export async function getDB() {
  if (!db) {
    db = await open({
      filename: './admin.db',
      driver: sqlite3.Database
    });
    
    await initializeDB();
  }
  return db;
}

async function initializeDB() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shortDescription TEXT,
      originalPrice REAL NOT NULL,
      discountedPrice REAL NOT NULL,
      images TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
    
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY (orderId) REFERENCES orders (id),
      FOREIGN KEY (productId) REFERENCES products (id)
    );
    
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      discountType TEXT NOT NULL,
      discountValue REAL NOT NULL,
      minOrderAmount REAL,
      maxDiscount REAL,
      validFrom DATETIME NOT NULL,
      validUntil DATETIME NOT NULL,
      usageLimit INTEGER,
      usedCount INTEGER DEFAULT 0,
      isActive BOOLEAN DEFAULT true
    );
     -- Order details table (NEW)
    CREATE TABLE IF NOT EXISTS order_details (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      shippingAddress TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (id)
    );
    
    -- Order status history table (NEW)
    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (id)
    );
  `);
}