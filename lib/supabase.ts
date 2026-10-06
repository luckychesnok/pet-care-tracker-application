import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yaffchemygbreyohjwon.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlhZmZjaGVteWdicmV5b2hqd29uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MDM5OTcsImV4cCI6MjEwNjE3OTk5N30.ULem9heKPnMi8CUYliTLEUFtKYRKwnNtT5Cui-S_rvU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);