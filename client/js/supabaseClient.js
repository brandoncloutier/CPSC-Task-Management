import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = "https://jwymozsdutaedjklyspu.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3eW1venNkdXRhZWRqa2x5c3B1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MTMwMDcsImV4cCI6MjA3NTE4OTAwN30._SXCzTbetNvAQ2Oh9cmmiOMG1RClGN5VwVAv3FhsliI"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)