import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eepzxaypwjcgrvxzrnso.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlcHp4YXlwd2pjZ3J2eHpybnNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzI2MDcsImV4cCI6MjA3NjAwODYwN30.DVdM31vbMBm33S7Iller7P8V2dkuvBUUHERk5XvT3oE';

export const supabase = createClient(supabaseUrl, supabaseKey);
'https://eepzxaypwjcgrvxzrnso.supabase.co';