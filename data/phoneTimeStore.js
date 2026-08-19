// Postgres-backed phone-time store via Supabase — replaces the in-memory
// array pages/api/phone-time.js used to hold (`let phoneTimeEntries = []`),
// which lost every logged entry on a server restart and, on Vercel's
// serverless functions specifically, could reset on essentially any
// request since there's no guarantee of the same warm instance handling
// the next one. Mirrors data/taskStore.js's pattern: the `phone_time_entries`
// table uses snake_case columns, mapped to/from the app's existing
// {id, minutes, date} entry shape so pages/api/phone-time.js and its
// callers (PhoneTimeLogger.js, useCorrelationData.js) don't need to change
// what shape they expect.
import { createClient } from '@supabase/supabase-js'

// Server-only client — uses the secret key (not the public anon key)
// since this file is only ever imported from pages/api/* route handlers.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

function toEntry(row) {
  if (!row) return null
  return {
    id: row.id,
    minutes: row.minutes,
    date: row.entry_date,
  }
}

function toRow(input) {
  const row = {}
  if ('minutes' in input) row.minutes = input.minutes
  if ('date' in input) row.entry_date = input.date
  return row
}

export async function getAllPhoneTimeEntries() {
  const { data, error } = await supabase
    .from('phone_time_entries')
    .select('*')
    .order('entry_date', { ascending: true })

  if (error) throw error
  return data.map(toEntry)
}

export async function addPhoneTimeEntry(input) {
  const { data, error } = await supabase
    .from('phone_time_entries')
    .insert(toRow(input))
    .select()
    .single()

  if (error) throw error
  return toEntry(data)
}
