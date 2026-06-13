import { createClient } from '@supabase/supabase-js'

// These are the public project URL + publishable (anon) key. They are safe to
// ship in the client: every table is protected by Row Level Security in Postgres.
// You can override them via a local .env file (see .env.example).
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gsgfiicjnzpfwlgpwhtt.supabase.co'

const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Jsh2fjJK609gSxWx5ILuQg_IeYF9FpF'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 10 },
  },
})
