// scripts/test-email.ts
import { config } from 'dotenv';

// Load environment variables FIRST
console.log('🔧 Loading environment variables...');
config({ path: '.env.local' });

// Now import the email module
import { testEmailSetup } from '../lib/email';

async function testEmail() {
  console.log('🚀 Testing email configuration...');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? '✅ Found' : '❌ Missing');
  
  const success = await testEmailSetup();
  
  if (success) {
    console.log('🎉 Email setup is working correctly!');
  } else {
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Sign up at https://resend.com');
    console.log('2. Get your API key from https://resend.com/api-keys');
    console.log('3. Add RESEND_API_KEY=your_key_here to .env.local');
    console.log('4. Restart your development server');
    console.log('5. Run this test again');
  }
}

testEmail();