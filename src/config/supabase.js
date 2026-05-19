import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ddriszizvcdnciqddwyw.supabase.co';
const supabaseKey = 'sb_publishable_j7oDwiEZ9oJDtnEi3Hl9Cw_3_ViqWyT';

export const supabase = createClient(supabaseUrl, supabaseKey);
