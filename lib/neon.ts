// lib/neon.ts
import { Pool } from 'pg';

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
      // Add connection timeout
      connectionTimeoutMillis: 10000,
      // Add query timeout
      query_timeout: 10000,
    });

    // Test connection
    pool.on('connect', () => {
      console.log('Connected to Neon database');
    });

    pool.on('error', (err) => {
      console.error('Neon database connection error:', err);
    });
  }
  return pool;
}

export async function query(text: string, params?: any[]) {
  const client = await getPool().connect();
  try {
    console.log('Executing query:', text);
    const result = await client.query(text, params);
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

    await client.query('COMMIT');
    console.log('Neon database migrated successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}