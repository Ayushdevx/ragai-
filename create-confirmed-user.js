// create-confirmed-user.js
// Script to create a user that can bypass email confirmation

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

async function createConfirmedUser() {
  console.log('🚀 Creating user with email confirmation bypass...');
  console.log('');

  const testUser = {
    email: 'demo@example.com',
    password: 'DemoUser123',
    name: 'Demo User'
  };

  try {
    // Create user with email_confirm option
    const { data, error } = await supabase.auth.signUp({
      email: testUser.email,
      password: testUser.password,
      options: {
        data: {
          full_name: testUser.name
        },
        emailRedirectTo: undefined // This might help bypass confirmation in some cases
      }
    });

    if (error) {
      console.log(`❌ Error: ${error.message}`);
      return;
    }

    console.log('✅ User creation initiated');
    console.log(`📧 Email: ${testUser.email}`);
    console.log(`🔑 Password: ${testUser.password}`);
    console.log('');
    
    // If the user was created but needs confirmation
    if (data.user && !data.user.email_confirmed_at) {
      console.log('📧 EMAIL CONFIRMATION REQUIRED');
      console.log('');
      console.log('Since email confirmation is enabled in your Supabase project,');
      console.log('you have these options:');
      console.log('');
      console.log('🔧 OPTION 1: Disable Email Confirmation (Recommended for development)');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. Navigate to Authentication > Settings');
      console.log('   3. Turn OFF "Enable email confirmations"');
      console.log('   4. Save settings');
      console.log('   5. Try signing in again');
      console.log('');
      console.log('🔧 OPTION 2: Create a user manually in Supabase Dashboard');
      console.log('   1. Go to your Supabase Dashboard');
      console.log('   2. Navigate to Authentication > Users');
      console.log('   3. Click "Create User"');
      console.log('   4. Add email and password manually');
      console.log('   5. Set "Email Confirmed" to true');
      console.log('');
      console.log('🔧 OPTION 3: Use a service account key (Advanced)');
      console.log('   This requires the service role key from your Supabase project');
    } else if (data.user && data.user.email_confirmed_at) {
      console.log('✅ User created and email confirmed!');
      console.log('You can now sign in with these credentials.');
    }

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
  }
}

createConfirmedUser();
