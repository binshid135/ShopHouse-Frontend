// scripts/test-connection.ts
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

import { getPool } from '../lib/neon';

async function testConnection() {
  try {
    console.log('Testing Neon database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set in .env.local');
    }
    
    const pool = getPool();
    const client = await pool.connect();
    
    // Test simple query
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    client.release();
    console.log('✅ Connection successful!');
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    
    if (!process.env.DATABASE_URL) {
      console.log('\n🔧 Solution: Please set DATABASE_URL in .env.local file');
      console.log('Get your connection string from: https://neon.tech');
    } else {
      console.log('\n🔧 Check your DATABASE_URL format:');
      console.log('Should be: postgresql://user:pass@host/dbname?sslmode=require');
      console.log('Current DATABASE_URL:', process.env.DATABASE_URL);
    }
  }
}

testConnection();