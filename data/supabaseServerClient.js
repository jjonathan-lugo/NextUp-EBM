// Builds a Supabase client authenticated AS whichever user made the
// request — using the public anon key + their access token, not the
// service-role key data/taskStore.js and data/phoneTimeStore.js used to
// use everywhere. The service-role key bypasses Row Level Security
// entirely, so every route would have had to remember to manually
// filter every query by user_id, with a missed filter meaning a real
// data leak between users. With a client built from the user's own
// token instead, auth.uid() resolves inside Postgres and RLS policies
// (see the user_id + RLS migration SQL) enforce per-user access at the
// database level regardless of what the route code does.
import { createClient } from '@supabase/supabase-js'

export function getBearerToken(req) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')
  if (scheme !== 'Bearer' || !token) return null
  return token
}

export function createUserSupabaseClient(accessToken) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      persistSession: false,
    },
  })
}

// Verifies the bearer token on an API request and returns both the
// authenticated user and a Supabase client scoped to them, or null if
// the token is missing/invalid — callers should respond 401 in that case.
export async function requireUser(req) {
  const token = getBearerToken(req)
  if (!token) return null

  const supabase = createUserSupabaseClient(token)
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) return null

  return { user: data.user, supabase }
}
