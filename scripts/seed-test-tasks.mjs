// One-off dev helper — NOT part of the app itself, just a way to
// populate a handful of realistic tasks with varied due dates, effort,
// and priority so Smart Start's decision logic (see
// components/smart-start-feed/TaskPicker.js) has more than one or two
// inputs to actually choose between.
//
// v2: now that auth exists, every task needs a real user_id — RLS
// enforces this (see the user_id + RLS migration). This talks to
// Supabase directly with the service-role key instead of going through
// /api/tasks, since a standalone script has no browser session to pull
// a bearer token from. Same trusted-server-side pattern the app itself
// used before auth existed.
//
// v3: identify the user by EMAIL (looked up via the Supabase admin
// API) as an alternative to USER_ID. Also moved the actual TASKS data
// out to seedTaskData.mjs (no side effects) so
// remove-seeded-test-tasks.mjs can import just the data without also
// triggering this file's env checks — see that module's comment.
//
// Requires SUPABASE_URL + SUPABASE_SECRET_KEY (already in .env.local)
// and EMAIL or USER_ID to identify who these tasks belong to.
//
// Usage (no dev server needs to be running — this writes to Supabase
// directly):
//   EMAIL=you@example.com node scripts/seed-test-tasks.mjs
//   USER_ID=<your-uuid> node scripts/seed-test-tasks.mjs
import { createClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './loadEnv.mjs'
import { TASKS } from './seedTaskData.mjs'

loadEnvLocal()

const { EMAIL, USER_ID } = process.env
if (!EMAIL && !USER_ID) {
  console.error('Set EMAIL (your account email) or USER_ID (Supabase auth user ID).')
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

async function resolveUserId() {
  if (USER_ID) return USER_ID

  const { data, error } = await supabase.auth.admin.listUsers()
  if (error) {
    console.error('Could not look up users:', error.message)
    process.exit(1)
  }

  const match = data.users.find((user) => user.email?.toLowerCase() === EMAIL.toLowerCase())
  if (!match) {
    console.error(`No account found for ${EMAIL}.`)
    process.exit(1)
  }

  return match.id
}

// Mirrors hooks/useWeightCalculator.js exactly — kept in sync manually
// since this script talks to the database directly rather than through
// pages/api/weighting.js.
const PRIORITY_WEIGHT = 1.5
const EFFORT_WEIGHT = 0.5
function computeWeight(priority, effort) {
  return Math.round((priority * PRIORITY_WEIGHT + effort * EFFORT_WEIGHT) * 10) / 10
}

async function seed() {
  const userId = await resolveUserId()

  console.log(`Seeding ${TASKS.length} test tasks for user ${userId} ...\n`)

  for (const task of TASKS) {
    const weight = computeWeight(task.priority, task.effort)

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        effort: task.effort,
        priority: task.priority,
        weight,
        due_date: task.dueDate,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error(`✗ ${task.title} — ${error.message}`)
      continue
    }

    console.log(`✓ ${data.title} — weight ${weight}, due ${data.due_date || 'no due date'}`)
  }

  console.log('\nDone. Refresh Smart Start to see the new decision.')
  console.log('To remove these again: EMAIL=... node scripts/remove-seeded-test-tasks.mjs')
}

seed()
