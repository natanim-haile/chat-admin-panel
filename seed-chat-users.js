// Seeds mock chat users into public.users (uses service role)
// Usage (PowerShell example):
//   $env:SUPABASE_SERVICE_ROLE_KEY="..."
//   $env:NEXT_PUBLIC_SUPABASE_URL="https://YOURPROJECT.supabase.co"
//   node seed-chat-users.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

const mockUsers = [
  { first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', profile_picture: null },
  { first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', profile_picture: null },
  { first_name: 'Carla', last_name: 'Nguyen', email: 'carla@example.com', profile_picture: null },
  { first_name: 'David', last_name: 'Kim', email: 'david@example.com', profile_picture: null },
  { first_name: 'Ella', last_name: 'Brown', email: 'ella@example.com', profile_picture: null }
]

async function main() {
  const { data, error } = await supabase.from('users').insert(mockUsers).select('id, email')
  if (error) {
    console.error('Insert failed:', error.message)
    process.exit(1)
  }
  console.log('Seeded users:', data)
}

main()
