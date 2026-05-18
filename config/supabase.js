// config/supabase.js
// =============================================
// Supabase Client Configuration
// =============================================
// This file sets up two Supabase clients:
// 1. Regular client (uses anon key) - for normal operations
// 2. Admin client (uses service key) - for admin operations like creating users

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Validate that required env vars are present
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please check your .env file has SUPABASE_URL and SUPABASE_ANON_KEY');
  process.exit(1);
}

// Regular Supabase client - used for most database operations
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Admin Supabase client - bypasses Row Level Security (RLS)
// Used for user management operations
const supabaseAdmin = SUPABASE_SERVICE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to regular client if service key not provided

module.exports = { supabase, supabaseAdmin };
