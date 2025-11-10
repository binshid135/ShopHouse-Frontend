// scripts/setup-all-tables.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { query } from '../lib/neon';

async function setupAllTables() {
  try {
    console.log('🔧 Setting up all database tables...');
    
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password TEXT,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'customer',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Users table created');
    
    // User sessions table
    await query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ User sessions table created');
    
    // User OTPs table
    await query(`
      CREATE TABLE IF NOT EXISTS user_otps (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL,
        otp TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        used BOOLEAN DEFAULT false
      );
    `);
    console.log('✅ User OTPs table created');
    
    // Password reset tokens table
    await query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Password reset tokens table created');
    
    // Products table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        short_description TEXT,
        original_price DECIMAL(10,2) NOT NULL,
        discounted_price DECIMAL(10,2) NOT NULL,
        stock INTEGER DEFAULT 0,
        category TEXT DEFAULT 'Uncategorized',
        images TEXT[],
        is_recommended BOOLEAN DEFAULT false,
        is_most_recommended BOOLEAN DEFAULT false,
        recommendation_order INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Products table created');
    
    // Orders table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Orders table created');
    
    // Order items table
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `);
    console.log('✅ Order items table created');
    
    // Order details table
    await query(`
      CREATE TABLE IF NOT EXISTS order_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        shipping_address TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Order details table created');
    
    // Cart items table
    await query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id TEXT NOT NULL,
        product_id UUID REFERENCES products(id),
        quantity INTEGER DEFAULT 1,
        user_id UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Cart items table created');
    
    // Create all indexes
    console.log('📊 Creating indexes...');
    
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_otps_expires_at ON user_otps(expires_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)');
    await query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_products_recommended ON products(is_recommended, is_most_recommended)');
    await query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)');
    
    console.log('✅ All indexes created');
    console.log('🎉 All database tables setup completed!');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAllTables();