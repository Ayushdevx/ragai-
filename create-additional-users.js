// create-additional-users.js
// Script to create additional test users for development

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

// Additional test users
const testUsers = [
  {
    email: 'admin@docuai.com',
    password: 'AdminUser123',
    name: 'Admin User'
  },
  {
    email: 'user@docuai.com',
    password: 'RegularUser123',
    name: 'Regular User'
  },
  {
    email: 'demo@docuai.com',
    password: 'DemoUser123',
    name: 'Demo User'
  }
];

async function createTestUsers() {
  console.log('🚀 Creating additional test users...\n');

  for (const user of testUsers) {
    try {
      console.log(`Creating user: ${user.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            full_name: user.name
          }
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`✅ ${user.email} already exists`);
        } else {
          console.log(`❌ Error creating ${user.email}: ${error.message}`);
        }
      } else {
        console.log(`✅ ${user.email} created successfully`);
      }
    } catch (error) {
      console.log(`❌ Error creating ${user.email}: ${error.message}`);
    }
  }

  console.log('\n📝 Available test user credentials:');
  console.log('================================');
  
  // Include the original test user
  const allUsers = [
    { email: 'test@docuai.com', password: 'TestUser123', name: 'Test User' },
    ...testUsers
  ];

  allUsers.forEach(user => {
    console.log(`👤 ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${user.password}`);
    console.log('');
  });
}

// Run the script
createTestUsers();
