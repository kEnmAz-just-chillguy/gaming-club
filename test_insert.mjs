import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://ddriszizvcdnciqddwyw.supabase.co';
const supabaseKey = 'sb_publishable_j7oDwiEZ9oJDtnEi3Hl9Cw_3_ViqWyT';
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { data, error } = await supabase.from('room_sessions').insert([{
    room_id: 6,
    room_number: 'B-03',
    start_time: '10:54',
    end_time: '10:54',
    session_mode: 'hours',
    play_amount: 30000,
    bar_amount: 0,
    total_amount: 30000,
    duration_secs: 57,
    payment_method: 'cash'
  }]).select();
  if (error) {
    console.error('Error code:', error.code, 'Message:', error.message);
  } else {
    console.log('Success:', data);
  }
}
run();
