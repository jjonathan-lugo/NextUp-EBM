// Undoes scripts/seed-test-tasks.mjs — fetches every real task and
// deletes only the ones whose title exactly matches one this repo's
// seed script creates, so it won't touch any task you added yourself
// even if it happens to share a due date or weight with a seeded one.
//
// Usage (with `npm run dev` already running in another terminal):
//   node scripts/remove-seeded-test-tasks.mjs
//
// Same BASE_URL override as the seed script:
//   BASE_URL=https://your-preview-url.vercel.app node scripts/remove-seeded-test-tasks.mjs

import { TASKS } from './seed-test-tasks.mjs'

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'
const SEEDED_TITLES = new Set(TASKS.map((task) => task.title))

async function removeSeeded() {
  console.log(`Looking for seeded test tasks at ${BASE_URL} ...\n`)

  let allTasks
  try {
    const response = await fetch(`${BASE_URL}/api/tasks`)
    if (!response.ok) {
      throw new Error(`GET /api/tasks failed with ${response.status}`)
    }
    allTasks = await response.json()
  } catch (error) {
    console.error('Could not fetch tasks:', error.message)
    console.error('Is `npm run dev` running? Is BASE_URL correct?')
    return
  }

  const toDelete = allTasks.filter((task) => SEEDED_TITLES.has(task.title))

  if (toDelete.length === 0) {
    console.log('No seeded test tasks found — nothing to remove.')
    return
  }

  console.log(`Removing ${toDelete.length} seeded test task(s):\n`)

  for (const task of toDelete) {
    try {
      const response = await fetch(`${BASE_URL}/api/tasks/${task.id}`, {
        method: 'DELETE',
      })
      if (!response.ok && response.status !== 204) {
        console.error(`✗ ${task.title} — ${response.status}`)
        continue
      }
      console.log(`✓ removed "${task.title}"`)
    } catch (error) {
      console.error(`✗ ${task.title} — request failed:`, error.message)
    }
  }

  console.log('\nDone.')
}

removeSeeded()
