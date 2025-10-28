// lib/database.ts
import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import { hashPassword } from "./auth-user";
import { v4 as uuidv4 } from "uuid";

// Define interface for table info
interface TableColumnInfo {
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

let db: Database | null = null;

export async function getDB(): Promise<Database> {
  if (!db) {
    db = await open({
      filename: "./admin.db",
      driver: sqlite3.Database,
    });

    await initializeDB();
  }
  return db;
}

async function initializeDB(): Promise<void> {
  if (!db) return;

  // Create all tables with basic structure first
  await db.exec(`
   CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      shortDescription TEXT,
      originalPrice REAL NOT NULL,
      discountedPrice REAL NOT NULL,
      images TEXT,
      isRecommended BOOLEAN DEFAULT 0,
      isMostRecommended BOOLEAN DEFAULT 0,
      recommendationOrder INTEGER DEFAULT 0,
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
      isActive BOOLEAN DEFAULT 1
    );
    
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
    
    CREATE TABLE IF NOT EXISTS order_status_history (
      id TEXT PRIMARY KEY,
      orderId TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (orderId) REFERENCES orders (id)
    );

    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      cartId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      userId TEXT, -- Add this column for authenticated users
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (productId) REFERENCES products (id)
    );
  `);
  
  // Now update the users table with authentication columns
  await migrateUsersTable();

  // Create authentication tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS user_sessions (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expiresAt DATETIME NOT NULL,
      used BOOLEAN DEFAULT 0,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id)
    );
  `);

  // Add indexes for better performance and security
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(userId);
    CREATE INDEX IF NOT EXISTS idx_order_details_order_id ON order_details(orderId);
    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(userId);
    CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cartId);
  `);

  
  // Add the new columns if they don't exist
  try {
    await db.run(`ALTER TABLE products ADD COLUMN isRecommended BOOLEAN DEFAULT 0`);
    await db.run(`ALTER TABLE products ADD COLUMN isMostRecommended BOOLEAN DEFAULT 0`);
    await db.run(`ALTER TABLE products ADD COLUMN recommendationOrder INTEGER DEFAULT 0`);
  } catch (error) {
    // Columns might already exist
    console.log('Product columns migration completed or not needed');
  }


  // Create demo user
  await createDemoUser();
  await migrateCartItemsTable();
}

async function migrateCartItemsTable(): Promise<void> {
  if (!db) return;

  try {
    const tableInfo = await db.all<TableColumnInfo[]>(`PRAGMA table_info(cart_items)`);
    const columns = tableInfo.map((col) => col.name);

    if (!columns.includes("userId")) {
      await db.run(`ALTER TABLE cart_items ADD COLUMN userId TEXT`);
      console.log("Added userId column to cart_items table");
    }
  } catch (error) {
    console.log("Cart items migration completed or not needed");
  }
}

async function migrateUsersTable(): Promise<void> {
  if (!db) return;

  try {
    // Check if users table needs migration
    const tableInfo = await db.all<TableColumnInfo[]>(`PRAGMA table_info(users)`);
    const columns = tableInfo.map((col) => col.name);

    // Add missing authentication columns
    if (!columns.includes("password")) {
      await db.run(`ALTER TABLE users ADD COLUMN password TEXT`);
      console.log("Added password column to users table");
    }

    if (!columns.includes("phone")) {
      await db.run(`ALTER TABLE users ADD COLUMN phone TEXT`);
      console.log("Added phone column to users table");
    }

    if (!columns.includes("address")) {
      await db.run(`ALTER TABLE users ADD COLUMN address TEXT`);
      console.log("Added address column to users table");
    }

    if (!columns.includes("role")) {
      await db.run(`ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'customer'`);
      console.log("Added role column to users table");
    }

    if (!columns.includes("isActive")) {
      await db.run(`ALTER TABLE users ADD COLUMN isActive BOOLEAN DEFAULT 1`);
      console.log("Added isActive column to users table");
    }

    if (!columns.includes("updatedAt")) {
      await db.run(
        `ALTER TABLE users ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP`
      );
      console.log("Added updatedAt column to users table");
    }

    // Set default values for existing users
    await db.run(`UPDATE users SET role = 'customer' WHERE role IS NULL`);
    await db.run(`UPDATE users SET isActive = 1 WHERE isActive IS NULL`);
  } catch (error) {
    console.error("Migration error:", error);
  }
}

async function createDemoUser(): Promise<void> {
  if (!db) return;

  try {
    const demoUser = await db.get("SELECT * FROM users WHERE email = ?", [
      "demo@shophouse.com",
    ]);
    if (!demoUser) {
      const hashedPassword = await hashPassword("demo123");
      await db.run(
        `INSERT INTO users (id, email, name, password, role, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(),
          "demo@shophouse.com",
          "Demo User",
          hashedPassword,
          "customer",
          1,
          new Date().toISOString(),
          new Date().toISOString(),
        ]
      );
      console.log("Demo user created successfully");
    }
  } catch (error) {
    console.error("Error creating demo user:", error);
  }
}