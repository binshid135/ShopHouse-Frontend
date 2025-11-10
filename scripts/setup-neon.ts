// scripts/setup-neon.ts
import { migrateDatabase } from '../lib/neon';

async function setup() {
  try {
    await migrateDatabase();
    console.log('Neon database setup completed!');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setup();