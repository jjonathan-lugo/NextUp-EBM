// Postgres-backed phone-time store via Supabase. Mirrors
// data/taskStore.js's pattern: the `phone_time_entries` table uses
// snake_case columns, mapped to/from the app's {id, minutes, date}
// shape.
//
// Like taskStore.js, functions now take a `supabase` client built per
// request from the calling user's access token (see
// data/supabaseServerClient.js) instead of a service-role singleton, so
// Row Level Security enforces per-user access at the database level.
export function toEntry(row) {
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

export async function getAllPhoneTimeEntries(supabase) {
  const { data, error } = await supabase
    .from('phone_time_entries')
    .select('*')
    .order('entry_date', { ascending: true })

  if (error) throw error
  return data.map(toEntry)
}

export async function addPhoneTimeEntry(supabase, input) {
  const { data, error } = await supabase
    .from('phone_time_entries')
    .insert(toRow(input))
    .select()
    .single()

  if (error) throw error
  return toEntry(data)
}
