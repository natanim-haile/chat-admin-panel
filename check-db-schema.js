const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    console.log('Checking current database schema...\n');
    
    // Fetch a sample user to see what columns exist
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    if (data && data.length > 0) {
        console.log('Current columns in users table:');
        console.log(Object.keys(data[0]));
        console.log('\nSample user data:');
        console.log(data[0]);
    } else {
        console.log('No users found in the table');
    }
}

checkSchema();
