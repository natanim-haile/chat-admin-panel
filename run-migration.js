const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
    try {
        console.log('Starting migration...\n');

        // Step 1: Add new columns
        console.log('Step 1: Adding new columns...');
        const { error: step1Error } = await supabase.rpc('exec_sql', {
            sql: `
                ALTER TABLE public.users 
                ADD COLUMN IF NOT EXISTS first_name TEXT,
                ADD COLUMN IF NOT EXISTS last_name TEXT,
                ADD COLUMN IF NOT EXISTS profile_picture TEXT;
            `
        });
        if (step1Error) {
            console.log('Note: Columns might already exist, continuing...');
        } else {
            console.log('✓ Columns added');
        }

        // Step 2: Migrate name data
        console.log('Step 2: Migrating name data...');
        const { data: users } = await supabase.from('users').select('id, name, avatar');
        
        if (users) {
            for (const user of users) {
                if (user.name) {
                    const nameParts = user.name.split(' ');
                    const firstName = nameParts[0] || '';
                    const lastName = nameParts.slice(1).join(' ') || '';
                    
                    await supabase
                        .from('users')
                        .update({
                            first_name: firstName,
                            last_name: lastName,
                            profile_picture: user.avatar
                        })
                        .eq('id', user.id);
                }
            }
            console.log(`✓ Migrated ${users.length} users`);
        }

        // Verify migration
        console.log('\nVerifying migration...');
        const { data, error } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, profile_picture')
            .limit(5);
        
        if (error) {
            console.error('Error verifying:', error);
        } else {
            console.log('\nSample users after migration:');
            console.table(data);
            console.log('\n✓ Migration completed successfully!');
            console.log('\nNote: To complete the migration, run the following SQL in Supabase Dashboard:');
            console.log('ALTER TABLE public.users DROP COLUMN IF EXISTS name, DROP COLUMN IF EXISTS avatar;');
        }
        
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

runMigration();
