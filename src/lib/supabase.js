import { createClient } from '@supabase/supabase-js';

// Hardcoded values — these are public keys, safe to commit
const SUPABASE_URL = 'https://cjcvtkcqbaubyqlijssj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqY3Z0a2NxYmF1YnlxbGlqc3NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTg3NDMsImV4cCI6MjA4NzY5NDc0M30.kBZifO9Unx6kLvQ9Lqb-VKA3LDVQ-V9ROd-tLj2L-Jk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
