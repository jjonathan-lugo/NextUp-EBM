// Minimal .env.local loader for one-off scripts under scripts/. Not a
// dependency of the app itself (Next.js loads .env.local on its own) —
// this exists only so `node scripts/whatever.mjs` run outside Next.js
// still sees the same SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY etc.
//
// Strips wrapping quotes from values: the .env.local pulled down via
// `vercel env pull` wraps every value in double quotes (e.g.
// SUPABASE_URL="https://..."), and without stripping them, the literal
// quote characters end up inside process.env.SUPABASE_URL, which broke
// createClient() with "Invalid supabaseUrl" the first time this existed.
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function loadEnv(filename = '.env.local') {
  const envPath = path.join(__dirname, '..', filename)
  let contents
  try {
    contents = readFileSync(envPath, 'utf8')
  } catch {
    return
  }

  for (const line of contents.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(trimmed)
    if (!match) continue

    const [, key, rawValue] = match
    if (process.env[key]) continue // don't override an already-set env var

    const unquoted = /^(['"])(.*)\1$/.exec(rawValue)
    process.env[key] = unquoted ? unquoted[2] : rawValue
  }
}
