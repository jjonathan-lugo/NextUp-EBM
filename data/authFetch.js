// Wraps fetch to attach the current user's Supabase access token as a
// Bearer auth header, so API routes can build a per-request client that
// acts as that specific user (see data/supabaseServerClient.js) instead
// of the old service-role client that bypassed Row Level Security
// entirely. Every client-side call to our own /api/* routes should go
// through this instead of plain fetch now that those routes require
// auth. Falls back to a plain unauthenticated request if there's no
// session — the API route will 401, which is the correct behavior for a
// signed-out user.
import { supabase } from './supabaseClient'

export async function authFetch(url, options = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = {
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  return fetch(url, { ...options, headers })
}
