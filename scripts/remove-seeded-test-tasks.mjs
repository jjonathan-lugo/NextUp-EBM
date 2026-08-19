// Undoes scripts/seed-test-tasks.mjs — fetches that user's tasks and
// deletes only the ones whose title exactly matches one this repo's
// seed script creates, so it won't touch anything you added yourself
// even if it happens to share a due date or weight with a seeded one.
//
// v2: talks to Supabase directly with the service-role key, same as
// seed-test-tasks.mjs now does — see that file's comment for why.
//
// Usage:
//   USER_ID=<your-uuid> node scripts/remove-seeded-test-tasks.mjs
import { createClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './loadEnv.mjs'
import { TASKS } from './seed-test-tasks.mjs'

loadEnvLocal()

const USER_ID = process.env.USER_ID
if (!USER_ID) {
  console.error('Set USER_ID to the Supabase auth user ID whose seeded tasks should be removed.')
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)
const SEEDED_TITLES = new Set(TASKS.map((task) => task.title))

async function removeSeeded() {
  console.log(`Looking for seeded test tasks belonging to user ${USER_ID} ...\n`)

  const { data: allTasks, error } = await supabase
    .from('tasks')
    .select('id, title')
    .eq('user_id', USER_ID)

  if (error) {
    console.error('Could not fetch tasks:', error.message)
    return
  }

  const toDelete = allTasks.filter((task) => SEEDED_TITLES.has(task.title))

  if (toDelete.length === 0) {
    console.log('No seeded test tasks found — nothing to remove.')
    return
  }

  console.log(`Removing ${toDelete.length} seeded test task(s):\n`)

  for (const task of toDelete) {
    const { error: deleteError } = await supabase.from('tasks').delete().eq('id', task.id)

    if (deleteError) {
      console.error(`✗ ${task.title} — ${deleteError.message}`)
      continue
    }

    console.log(`✓ removed "${task.title}"`)
  }

  console.log('\nDone.')
}

removeSeeded()
