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
        process.env[match[1]] = match[2]
      }
    }
  } catch {
    // No .env.local — fine if the caller exported the vars another way.
  }
}
