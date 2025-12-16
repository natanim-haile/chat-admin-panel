const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');
require('dotenv').config({ path: '.env.local' });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

console.log('\n=== DATABASE MIGRATION ===\n');
console.log('To run this migration, you need your Supabase SERVICE_ROLE key.');
console.log('(Not the ANON key - the SERVICE_ROLE key has admin permissions)\n');
console.log('Get it from: https://supabase.com/dashboard/project/mzmockvpmovapqbjhuaf/settings/api\n');

rl.question('Paste your SERVICE_ROLE key here: ', async (serviceKey) => {
    const supabase = createClient(supabaseUrl, serviceKey);

    try {
        console.log('\nStarting migration...\n');

        // Step 1: Add new columns
        console.log('Step 1: Adding new columns...');
        await supabase.rpc('exec_sql', {
            sql: 'ALTER TABLE public.users ADD COLUMN IF NOT EXISTS first_name TEXT, ADD COLUMN IF NOT EXISTS last_name TEXT, ADD COLUMN IF NOT EXISTS profile_picture TEXT;'
        });

        // Step 2: Migrate data using JavaScript
        console.log('Step 2: Migrating data...');
        const { data: users } = await supabase.from('users').select('*');
        
        for (const user of users) {
            const nameParts = (user.name || '').split(' ');
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

        console.log(`✓ Migrated ${users.length} users\n`);

        // Verify
        const { data: verifyData } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, profile_picture')
            .limit(3);

        console.log('Sample migrated data:');
        console.table(verifyData);

        console.log('\n✅ Migration completed successfully!\n');
        console.log('Note: Old columns (name, avatar, role, status, last_active) are still present.');
        console.log('They can be removed manually from Supabase dashboard if needed.\n');

    } catch (error) {
        console.error('\n❌ Migration failed:', error.message);
    }

    rl.close();
});
