// lib/neon.ts
import { Pool, QueryResult, QueryResultRow } from 'pg';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to Neon database...');
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false
      },
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      max: 20,
    });

    pool.on('connect', () => {
      console.log('Connected to Neon database');
    });

    pool.on('error', (err) => {
      console.error('Neon database connection error:', err);
    });
  }
  return pool;
}

// Fixed generic type to extend QueryResultRow
export async function query<T extends QueryResultRow = any>(
  text: string, 
  params?: any[]
): Promise<QueryResult<T>> {
  const client = await getPool().connect();
  try {
    console.log('Executing query:', text.substring(0, 100) + '...');
    const start = Date.now();
    const result = await client.query<T>(text, params);
    const duration = Date.now() - start;
    console.log(`Query completed in ${duration}ms`);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function migrateDatabase() {
  console.log('Starting database migration...');
  
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');

    // Users table
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

    // User sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ User sessions table created');

    // User OTPs table
    await client.query(`
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
    await client.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Password reset tokens table created');

    // Products table
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

    // Orders table
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        total DECIMAL(10,2) NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Orders table created');

    // Order items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Order items table created');

    // Order details table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_details (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
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

    // Order status history table
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_status_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
        status TEXT NOT NULL,
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Order status history table created');

    // Cart items table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        cart_id TEXT NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Cart items table created');

    // Coupons table
    await client.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        code TEXT UNIQUE NOT NULL,
        discount_type TEXT NOT NULL,
        discount_value DECIMAL(10,2) NOT NULL,
        min_order_amount DECIMAL(10,2),
        max_discount DECIMAL(10,2),
        valid_from TIMESTAMPTZ NOT NULL,
        valid_until TIMESTAMPTZ NOT NULL,
        usage_limit INTEGER,
        used_count INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    console.log('✅ Coupons table created');

    // Create indexes
    console.log('📊 Creating indexes...');
    
    await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_otps_email ON user_otps(email)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_user_otps_expires_at ON user_otps(expires_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_products_recommended ON products(is_recommended, is_most_recommended)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_coupons_active ON coupons(is_active, valid_until)');

    console.log('✅ All indexes created');

    await client.query('COMMIT');
    console.log('🎉 All Neon database tables migrated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    const result = await query('SELECT NOW()');
    console.log('Database connection healthy');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
}

// Demo user creation (you'll need to import hashPassword)
export async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1', 
      ['demo@shophouse.com']
    );

    if (existingUser.rows.length === 0) {
      // You'll need to import and use your hashPassword function
      // const hashedPassword = await hashPassword('demo123');
      
      await query(
        `INSERT INTO users (email, name, password, role, is_active) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          'demo@shophouse.com',
          'Demo User',
          'temp_password', // Replace with hashed password
          'customer',
          true
        ]
      );
      console.log('Demo user created successfully');
    } else {
      console.log('Demo user already exists');
    }
  } catch (error) {
    console.error('Error creating demo user:', error);
  }
}

export async function initializeDatabase() {
  try {
    await migrateDatabase();
    await createDemoUser();
    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}