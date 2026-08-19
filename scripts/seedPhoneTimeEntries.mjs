// One-off script: adds 15 sample phone-time log entries (one per day,
// the last 15 days) straight into the `phone_time_entries` table via
// the Supabase service-role key. Mirrors scripts/seedRandomTasks.mjs —
// same reasoning applies here:
//
// Doesn't import data/phoneTimeStore.js even though its
// toRow()/toEntry() do this exact column mapping already — that file
// uses import/export syntax with an extensionless relative import,
// which only works through Next.js's bundler, not plain `node`. This
// script duplicates the small camelCase -> snake_case mapping inline
// instead.
//
// Doesn't set any per-user/owner column — the tasks table turned out
// not to have a "user_id" column despite data/taskStore.js's comments
// claiming it did (see scripts/seedRandomTasks.mjs and the commit that
// added it), so this doesn't assume phone_time_entries has one either.
// If it turns out to need one, these rows will insert without an owner.
//
// Usage:
//   node scripts/seedPhoneTimeEntries.mjs
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from './loadEnv.mjs'

loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// One entry per day, most recent 15 days ending today (2026-08-19) —
// each stored as an ISO timestamp (matches PhoneTimeLogger.js's own
// `date: new Date().toISOString()`), fixed at 9pm local-ish so they
// sort predictably. Minutes are varied (60-260) rather than evenly
// spaced, so the correlation chart has some real texture to show.
const ENTRIES = [
  { date: '2026-08-05T21:00:00Z', minutes: 145 },
  { date: '2026-08-06T21:00:00Z', minutes: 210 },
  { date: '2026-08-07T21:00:00Z', minutes: 95 },
  { date: '2026-08-08T21:00:00Z', minutes: 260 },
  { date: '2026-08-09T21:00:00Z', minutes: 180 },
  { date: '2026-08-10T21:00:00Z', minutes: 60 },
  { date: '2026-08-11T21:00:00Z', minutes: 220 },
  { date: '2026-08-12T21:00:00Z', minutes: 130 },
  { date: '2026-08-13T21:00:00Z', minutes: 75 },
  { date: '2026-08-14T21:00:00Z', minutes: 190 },
  { date: '2026-08-15T21:00:00Z', minutes: 240 },
  { date: '2026-08-16T21:00:00Z', minutes: 110 },
  { date: '2026-08-17T21:00:00Z', minutes: 165 },
  { date: '2026-08-18T21:00:00Z', minutes: 200 },
  { date: '2026-08-19T21:00:00Z', minutes: 85 },
]

function toRow(entry) {
  return {
    entry_date: entry.date,
    minutes: entry.minutes,
  }
}

async function main() {
  const { data, error } = await supabase
    .from('phone_time_entries')
    .insert(ENTRIES.map(toRow))
    .select()

  if (error) {
    console.error('Seeding failed:', error.message)
    process.exit(1)
  }

  for (const row of data) {
    console.log(`Added: ${row.entry_date} — ${row.minutes} min (${row.id})`)
  }
  console.log(`Done — added ${data.length} phone-time entries.`)
}

main()
