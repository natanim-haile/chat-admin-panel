// Simple admin seeder (no RLS / low friction)
// If the auth user already exists, it reuses that user. Otherwise, it creates it.
// Requires: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env
// Usage:
//   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_NAME="..." \
//   node seed-admin.js

const { createClient } = require('@supabase/supabase-js')
// Load .env.local if dotenv is available; otherwise rely on process.env
try {
  require('dotenv').config({ path: '.env.local' })
} catch (err) {
  // dotenv not installed — that's fine if env vars are provided externally
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD
const name = process.env.ADMIN_NAME || null

if (!url || !serviceRole) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}
if (!email || !password) {
  console.error('Missing ADMIN_EMAIL or ADMIN_PASSWORD')
  process.exit(1)
}

const supabase = createClient(url, serviceRole)

async function main() {
  // Try to find existing user first
  let authUserId = null
  const { data: listData, error: listErr } = await supabase.auth.admin.listUsers()
  if (listErr) {
    console.error('List users failed:', listErr.message)
    process.exit(1)
  }
  authUserId = listData.users.find(u => u.email === email)?.id || null

  // Create auth user if not found
  if (!authUserId) {
    const { data: created, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name }
    })
    if (createErr) {
      console.error('Create auth user failed:', createErr.message)
      process.exit(1)
    }
    authUserId = created.user.id
  }

  // Upsert into admins table to ensure auth_user_id is set
  const { error: upsertErr } = await supabase
    .from('admins')
    .upsert(
      { auth_user_id: authUserId, email, name },
      { onConflict: 'email' }
    )
    .single()

  if (upsertErr) {
    console.error('Insert/update admin row failed:', upsertErr.message)
    process.exit(1)
  }

  console.log('✅ Admin ensured:', { email, name })
}

main()
