// scripts/setup-production.ts
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { getPool } from '../lib/neon';

async function setupProduction() {
  try {
    console.log('🔧 Setting up production database...');
    console.log('📝 Checking environment variables...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in .env.local');
    }
    
    console.log('✅ DATABASE_URL is set');
    console.log('🔌 Testing database connection...');
    
    const pool = getPool();
    const client = await pool.connect();
    
    // Test connection
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Database connected:', versionResult.rows[0].version.split(',')[0]);
    
    console.log('🗃️ Creating tables...');
    
    // Create products table
    await client.query(`
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
    
    // Create users table
    await client.query(`
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
    
    // Create orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id),
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Orders table created');
    
    // Create order_items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id),
        product_id UUID REFERENCES products(id),
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `);
    console.log('✅ Order items table created');
    
    // Create cart_items table
    await client.query(`
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
    
    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_products_recommended ON products(is_recommended, is_most_recommended);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
    `);
    console.log('✅ Indexes created');
    
    client.release();
    
    console.log('🎉 Production database setup completed successfully!');
    console.log('\n📊 You can now:');
    console.log('   - Add products through your admin panel');
    console.log('   - Users will be created automatically when they sign up');
    console.log('   - Start using your application with Neon database');
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupProduction();