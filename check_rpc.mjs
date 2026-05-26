const supabaseUrl = 'https://ddriszizvcdnciqddwyw.supabase.co';
const supabaseKey = 'sb_publishable_j7oDwiEZ9oJDtnEi3Hl9Cw_3_ViqWyT';

async function run() {
  const res = await fetch(`${supabaseUrl}/rest/v1/`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  const data = await res.json();
  console.log('Data:', data);
}
run();
