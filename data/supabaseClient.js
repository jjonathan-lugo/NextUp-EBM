// Browser-side Supabase client — uses the public anon key (safe to ship
// to the browser), unlike data/taskStore.js and data/phoneTimeStore.js,
// which use SUPABASE_SECRET_KEY and only ever run server-side. This is
// the client that owns sign-in/sign-out and the session; API requests
// then attach that session's access token (see data/authFetch.js) so
// server code can act as that specific user via
// data/supabaseServerClient.js.
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
