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
// Requires SUPABASE_URL + SUPABASE_SECRET_KEY (already in .env.local)
// and USER_ID — the Supabase auth user ID to attach these tasks to.
// Find yours: sign in once via the app, then Supabase Dashboard →
// Authentication → Users → copy your UUID.
//
// Usage (no dev server needs to be running — this writes to Supabase
// directly):
//   USER_ID=<your-uuid> node scripts/seed-test-tasks.mjs
//
// Due dates are computed relative to whenever you run this, not
// hardcoded, so the overdue/due-today/due-later spread stays meaningful
// no matter when you run it.
//
// Also seeds a few tasks with NO due date, to exercise the "No Deadline
// — Do This Next" section (weight-only ranking via rankByWeight in
// data/rankTasks.js).
import { createClient } from '@supabase/supabase-js'
import { loadEnvLocal } from './loadEnv.mjs'

loadEnvLocal()

const USER_ID = process.env.USER_ID
if (!USER_ID) {
  console.error('Set USER_ID to the Supabase auth user ID to attach these tasks to.')
  console.error(
    'Find yours: sign in once via the app, then Supabase Dashboard → Authentication → Users.'
  )
  process.exit(1)
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY)

// Mirrors hooks/useWeightCalculator.js exactly — kept in sync manually
// since this script talks to the database directly rather than through
// pages/api/weighting.js.
const PRIORITY_WEIGHT = 1.5
const EFFORT_WEIGHT = 0.5
function computeWeight(priority, effort) {
  return Math.round((priority * PRIORITY_WEIGHT + effort * EFFORT_WEIGHT) * 10) / 10
}

function hoursFromNow(hours) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}
function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

// effort/priority are 1-5. Due dates deliberately spread across:
// overdue, due today (x2, to test weight breaking a same-day tie), a
// couple of near-term high-effort tasks (to test the day-budget
// scheduler pushing recommendedStart earlier than the due date), and
// far-out tasks including a high-weight one that should still lose to
// anything overdue or due today.
const TASKS = [
  {
    title: 'Submit lab report (overdue)',
    description: 'Was due yesterday — should win the Smart Start decision outright.',
    effort: 2,
    priority: 3,
    dueDate: hoursFromNow(-24),
  },
  {
    title: 'Finish reading ch. 5',
    description: 'Due today, low weight — tests losing a same-day tiebreak.',
    effort: 1,
    priority: 2,
    dueDate: hoursFromNow(4),
  },
  {
    title: 'Study for quiz',
    description: 'Due today, higher weight — should win the same-day tiebreak.',
    effort: 3,
    priority: 5,
    dueDate: hoursFromNow(6),
  },
  {
    title: 'Research paper outline',
    description: '2 days out but high effort — may push recommendedStart to today.',
    effort: 5,
    priority: 4,
    dueDate: daysFromNow(2),
  },
  {
    title: 'Group project slides',
    description: '3 days out, moderately effortful — competes for the same daily budget.',
    effort: 4,
    priority: 3,
    dueDate: daysFromNow(3),
  },
  {
    title: 'Optional reading',
    description: 'Far out, low priority/effort — should sit at the bottom.',
    effort: 1,
    priority: 1,
    dueDate: daysFromNow(10),
  },
  {
    title: 'Final project',
    description: 'Highest possible weight, but due a month out — should still lose to anything overdue or due today.',
    effort: 5,
    priority: 5,
    dueDate: daysFromNow(30),
  },
  // No due date — these only compete in the "No Deadline" section,
  // ranked purely by weight.
  {
    title: 'Read for fun',
    description: 'No due date, lowest weight — should sit at the bottom of that section.',
    effort: 1,
    priority: 1,
    dueDate: null,
  },
  {
    title: 'Clean desk',
    description: 'No due date, tied weight with "Water plants" — created first, so should win that tiebreak.',
    effort: 2,
    priority: 2,
    dueDate: null,
  },
  {
    title: 'Water plants',
    description: 'No due date, tied weight with "Clean desk" — created second, should lose that tiebreak.',
    effort: 2,
    priority: 2,
    dueDate: null,
  },
  {
    title: 'Update resume',
    description: 'No due date, highest weight of the bunch — should be the decided "No Deadline" task.',
    effort: 3,
    priority: 4,
    dueDate: null,
  },
]

async function seed() {
  console.log(`Seeding ${TASKS.length} test tasks for user ${USER_ID} ...\n`)

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
        user_id: USER_ID,
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
  console.log('To remove these again: USER_ID=... node scripts/remove-seeded-test-tasks.mjs')
}

// Exported so remove-seeded-test-tasks.mjs can match on the exact same
// titles instead of keeping its own copy of this list that could drift.
export { TASKS }

// Only auto-run when executed directly (`node scripts/seed-test-tasks.mjs`),
// not when imported by the cleanup script.
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
}
