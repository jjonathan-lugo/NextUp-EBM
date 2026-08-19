// Postgres-backed task store via Supabase — replaces the earlier
// in-memory stopgap now that a real database is connected. The `tasks`
// table uses snake_case columns; the app's Task shape (data/models/Task.js)
// is camelCase, so this file maps between the two in both directions.
import { createClient } from '@supabase/supabase-js'
import { createTask } from './models/Task'

// Server-only client — uses the secret key (not the public anon key)
// since this file is only ever imported from pages/api/* route handlers,
// which run server-side and never ship to the browser.
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

function toTask(row) {
  if (!row) return null
  return createTask({
    id: row.id,
    title: row.title,
    description: row.description,
    effort: row.effort,
    priority: row.priority,
    weight: row.weight,
    dueDate: row.due_date,
    recommendedStart: row.recommended_start,
    status: row.status,
    timeSpentSeconds: row.time_spent_seconds,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

function toRow(input) {
  const row = {}
  if ('title' in input) row.title = input.title
  if ('description' in input) row.description = input.description
  if ('effort' in input) row.effort = input.effort
  if ('priority' in input) row.priority = input.priority
  if ('weight' in input) row.weight = input.weight
  if ('dueDate' in input) row.due_date = input.dueDate
  if ('recommendedStart' in input) row.recommended_start = input.recommendedStart
  if ('status' in input) row.status = input.status
  if ('timeSpentSeconds' in input) row.time_spent_seconds = input.timeSpentSeconds
  return row
}

export async function getAllTasks() {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data.map(toTask)
}

export async function getTaskById(id) {
  const { data, error } = await supabase.from('tasks').select('*').eq('id', id).maybeSingle()

  if (error) throw error
  return toTask(data)
}

export async function addTask(input) {
  const { data, error } = await supabase.from('tasks').insert(toRow(input)).select().single()

  if (error) throw error
  return toTask(data)
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...toRow(updates), updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle()

  if (error) throw error
  return toTask(data)
}

export async function deleteTask(id) {
  const { error, count } = await supabase.from('tasks').delete({ count: 'exact' }).eq('id', id)

  if (error) throw error
  return count > 0
}
