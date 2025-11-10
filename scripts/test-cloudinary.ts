// scripts/test-cloudinary.ts
import { config } from 'dotenv';
config({ path: '.env.local' });

import { v2 as cloudinary } from 'cloudinary';

async function testCloudinary() {
  try {
    console.log('🔧 Testing Cloudinary configuration...');
    
    // Check if environment variables are set
    console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '❌ Not set');
    console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('API Secret:', process.env.CLOUDINARY_API_SECRET ? '✅ Set' : '❌ Not set');
    
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables are not properly set');
    }
    
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    // Test Cloudinary connection by listing resources
    console.log('🔌 Testing Cloudinary connection...');
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection successful!');
    console.log('Status:', result.status);
    
  } catch (error) {
    console.error('❌ Cloudinary test failed:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        console.log('\n🔧 Solution: Check your Cloudinary credentials:');
        console.log('   - Go to https://cloudinary.com/console');
        console.log('   - Verify your Cloud Name, API Key, and API Secret');
        console.log('   - Make sure they match exactly in your .env.local file');
      }
    }
  }
}

testCloudinary();