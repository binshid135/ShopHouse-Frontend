// scripts/debug-env.ts
import { config } from 'dotenv';

console.log('🔍 Debugging environment variables...');

// Load environment variables
config({ path: '.env.local' });

console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Set' : '❌ Not set');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');

// List all env vars that contain "RESEND" or "API"
console.log('\n📋 All environment variables:');
Object.keys(process.env).forEach(key => {
  if (key.includes('RESEND') || key.includes('API')) {
    console.log(`  ${key}: ${process.env[key] ? '***set***' : 'not set'}`);
  }
});