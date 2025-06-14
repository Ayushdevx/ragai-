// debug-auth.js
// Script to debug authentication issues

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Debugging Supabase Authentication');
console.log('=====================================');
console.log(`Supabase URL: ${supabaseUrl}`);
console.log(`Anon Key: ${supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'NOT SET'}`);
console.log('');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase configuration in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test credentials
const testCredentials = [
  { email: 'test@docuai.com', password: 'TestUser123' },
  { email: 'admin@docuai.com', password: 'AdminUser123' },
];

async function debugAuth() {
  try {
    // Test 1: Check if we can connect to Supabase
    console.log('🧪 Test 1: Testing Supabase connection...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Supabase connection successful');
      console.log('Current session:', session ? 'Active' : 'None');
    }
    console.log('');

    // Test 2: Try to sign in with test credentials
    console.log('🧪 Test 2: Testing authentication with test credentials...');
    
    for (const creds of testCredentials) {
      console.log(`Testing ${creds.email}...`);
      
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: creds.email,
          password: creds.password
        });
        
        if (error) {
          console.log(`❌ ${creds.email}: ${error.message}`);
          console.log(`   Error code: ${error.status || 'N/A'}`);
          console.log(`   Error details:`, error);
        } else {
          console.log(`✅ ${creds.email}: Sign in successful!`);
          console.log(`   User ID: ${data.user?.id}`);
          console.log(`   Email confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'No'}`);
          
          // Sign out after successful test
          await supabase.auth.signOut();
        }
      } catch (err) {
        console.log(`❌ ${creds.email}: Unexpected error - ${err.message}`);
      }
      console.log('');
    }

    // Test 3: Check if email confirmation is required
    console.log('🧪 Test 3: Checking Supabase project settings...');
    console.log('Note: If email confirmation is enabled in your Supabase project,');
    console.log('users need to confirm their email before they can sign in.');
    console.log('');

    // Test 4: Try creating a new test user to see if that works
    console.log('🧪 Test 4: Testing user creation...');
    const newTestEmail = `test-${Date.now()}@docuai.com`;
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email: newTestEmail,
        password: 'TestPassword123',
        options: {
          data: {
            full_name: 'Debug Test User'
          }
        }
      });
      
      if (error) {
        console.log(`❌ User creation failed: ${error.message}`);
      } else {
        console.log(`✅ Test user created: ${newTestEmail}`);
        console.log(`   Email confirmation required: ${!data.user?.email_confirmed_at}`);
      }
    } catch (err) {
      console.log(`❌ User creation error: ${err.message}`);
    }

  } catch (error) {
    console.error('❌ Debug script error:', error);
  }
}

// Run the debug script
debugAuth();
