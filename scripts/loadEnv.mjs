// Shared by the seed/cleanup scripts in this folder — a minimal
// .env.local loader, since these run under plain `node`, which doesn't
// read Next.js's .env.local the way `next dev`/`next build` do.
import { readFileSync } from 'node:fs'

export function loadEnvLocal() {
  try {
    const contents = readFileSync(new URL('../.env.local', import.meta.url), 'utf-8')
    for (const line of contents.split('\n')) {
      const match = line.match(/^([A-Z0-9_]+)=(.*)$/)
      if (match && !(match[1] in process.env)) {
        // Strip a matching pair of surrounding quotes, same as Next.js's
        // own .env loader does (and as the Vercel CLI now writes them —
        // e.g. SUPABASE_URL="https://..."). Without this, createClient()
        // gets a URL string with literal quote characters still in it
        // and fails with "Invalid supabaseUrl".
        const value = match[2]
        const unquoted = /^(['"])(.*)\1$/.exec(value)
        process.env[match[1]] = unquoted ? unquoted[2] : value
      }
    }
  } catch {
    // No .env.local — fine if the caller exported the vars another way.
  }
}
