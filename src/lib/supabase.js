import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cjcvtkcqbaubyqlijssj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqY3Z0a2NxYmF1YnlxbGlqc3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg3NDMsImV4cCI6MjA4NzY5NDc0M30.kBZifO9Unx6kLvQ9Lqb-VKA3LDVQ-V9ROd-tLj2L-Jk';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
