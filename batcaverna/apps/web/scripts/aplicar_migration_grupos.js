const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const env = fs.readFileSync(envPath, 'utf-8');
let url = '', key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) url = l.split('=')[1].trim().replace(/["']/g, '');
  if (l.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) key = l.split('=')[1].trim().replace(/["']/g, '');
});

const sql = fs.readFileSync(
  path.resolve(__dirname, '../../../supabase/migrations/022_grupos_chat.sql'),
  'utf-8'
);

async function run() {
  // Use Supabase REST SQL endpoint directly
  const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=minimal',
    },
    body: JSON.stringify({ sql_text: sql }),
  });

  if (!res.ok) {
    // exec_sql doesn't exist, use the raw SQL endpoint 
    console.log('exec_sql RPC not available, using pg-meta...');
    
    const pgRes = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': key,
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!pgRes.ok) {
      // Try the SQL endpoint used by supabase dashboard
      console.log('pg/query not available, trying /sql...');
      
      // Last resort: apply each ALTER individually via PostgREST 
      // Since we can't run raw SQL, let's create and apply via the management API
      const mgmtUrl = url.replace('.supabase.co', '.supabase.co');
      
      // Extract project ref from URL
      const projectRef = url.replace('https://', '').replace('.supabase.co', '');
      
      const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ query: sql }),
      });
      
      if (!sqlRes.ok) {
        console.log('\n⚠️  Cannot run SQL programmatically.');
        console.log('Please run this SQL in the Supabase Dashboard SQL Editor:');
        console.log('URL: ' + url.replace('.supabase.co', '.supabase.co').replace('https://', 'https://supabase.com/dashboard/project/') + '/sql');
        console.log('\n--- SQL ---');
        console.log(sql);
        console.log('--- END ---\n');
      } else {
        console.log('✅ Migration applied via management API');
      }
    } else {
      const result = await pgRes.json();
      console.log('✅ Migration applied via pg-meta:', result);
    }
  } else {
    console.log('✅ Migration applied successfully');
  }
}

run();
