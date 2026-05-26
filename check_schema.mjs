import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ddriszizvcdnciqddwyw.supabase.co';
const supabaseKey = 'sb_publishable_j7oDwiEZ9oJDtnEi3Hl9Cw_3_ViqWyT';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('room_sessions').select('*').limit(1);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Columns in room_sessions:', data.length > 0 ? Object.keys(data[0]) : 'No records found');
    console.log('Full data:', data);
  }
}
run();
