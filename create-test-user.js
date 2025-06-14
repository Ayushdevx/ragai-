// create-test-user.js
// Simple script to create a test user for development

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const testUser = {
  email: 'test@docuai.com',
  password: 'TestUser123',
  name: 'Test User'
};

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Password: ${testUser.password}`);
    console.log(`👤 Name: ${testUser.name}`);
    console.log('');

    // Sign up the test user
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.name
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Test user already exists!');
        console.log('📝 You can use these credentials to sign in:');
        console.log(`   Email: ${testUser.email}`);
        console.log(`   Password: ${testUser.password}`);
        return;
      }
      throw error;
    }

    if (data.user) {
      console.log('✅ Test user created successfully!');
      console.log('📝 Use these credentials to sign in:');
      console.log(`   Email: ${testUser.email}`);
      console.log(`   Password: ${testUser.password}`);
      
      if (data.user.email_confirmed_at) {
        console.log('✅ Email is already confirmed');
      } else {
        console.log('📧 Please check your email to confirm your account');
        console.log('   (Note: In development, email confirmation might be disabled)');
      }
    }

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

// Run the script
createTestUser();
