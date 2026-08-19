// Deletes EVERY task belonging to a user — not just seeded test tasks
// (see remove-seeded-test-tasks.mjs for that narrower, non-destructive
// version). This is irreversible, so on top of identifying the user it
// requires an explicit CONFIRM=yes so it can't be run by accident.
//
// Same trusted-server-side pattern as the seed/cleanup scripts: talks to
// Supabase directly with the service-role key (SUPABASE_SECRET_KEY in
// .env.local) since a standalone script has no browser session to pull
// a bearer token from.
//
// Identify the user with EITHER:
//   EMAIL=<your-account-email>   (looked up via the Supabase admin API)
//   USER_ID=<your-uuid>          (if you already have it)
//
// Usage:
//   EMAIL=you@example.com CONFIRM=yes node scripts/remove-all-tasks.mjs
//   USER_ID=<your-uuid> CONFIRM=yes node scripts/remove-all-tasks.mjs
import { createClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './loadEnv.mjs'

loadEnvLocal()

const { EMAIL, USER_ID, CONFIRM } = process.env

if (!EMAIL && !USER_ID) {
  console.error('Set EMAIL (your account email) or USER_ID (Supabase auth user ID).')
  process.exit(1)
}

if (CONFIRM !== 'yes') {
  console.error('This deletes EVERY task for this user — not just seeded test ones. This cannot be undone.')
  console.error('Re-run with CONFIRM=yes added to the same command to proceed.')
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

async function removeAll() {
  const userId = await resolveUserId()

  const { data: tasks, error: fetchError } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('user_id', userId)

  if (fetchError) {
    console.error('Could not fetch tasks:', fetchError.message)
    return
  }

  if (tasks.length === 0) {
    console.log('No tasks found for this user — nothing to remove.')
    return
  }

  console.log(`Deleting ${tasks.length} task(s) for user ${userId} ...\n`)

  const { error: deleteError } = await supabase.from('tasks').delete().eq('user_id', userId)

  if (deleteError) {
    console.error('Failed to delete tasks:', deleteError.message)
    return
  }

  for (const task of tasks) {
    console.log(`✓ removed "${task.title}"`)
  }

  console.log(`\nDone — ${tasks.length} task(s) removed.`)
}

removeAll()
