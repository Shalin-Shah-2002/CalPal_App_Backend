import { createAdminClient } from './config/appwrite.js';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('🔄 Testing Appwrite Connection...');
  console.log(`📍 Endpoint: ${process.env.APPWRITE_ENDPOINT}`);
  console.log(`🆔 Project ID: ${process.env.APPWRITE_PROJECT_ID}`);
  
  try {
    const { users } = createAdminClient();
    
    // Try to list users (limit 1) to verify API Key works
    console.log('🔑 Verifying API Key permissions...');
    const userList = await users.list([
      // queries can be empty
    ]);
    
    console.log('✅ Connection Successful!');
    console.log(`👥 Found ${userList.total} users in Appwrite project.`);
    
  } catch (error) {
    console.error('❌ Connection Failed!');
    console.error('Error details:', error.message);
    
    if (error.code === 401) {
      console.error('💡 Tip: Check your API Key and Project ID in .env');
    }
    if (error.code === 403) {
      console.error('💡 Tip: Check if your API Key has "users.read" scope enabled');
    }
  }
}

testConnection();
