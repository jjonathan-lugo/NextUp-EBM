// One-off dev helper — NOT part of the app itself, just a way to
// populate a handful of realistic tasks with varied due dates, effort,
// and priority so Smart Start's decision logic (see
// components/smart-start-feed/TaskPicker.js) has more than one or two
// inputs to actually choose between.
//
// Usage (with `npm run dev` already running in another terminal):
//   node scripts/seed-test-tasks.mjs
//
// Targets http://localhost:3000 by default; override with:
//   BASE_URL=https://your-preview-url.vercel.app node scripts/seed-test-tasks.mjs
//
// Due dates are computed relative to whenever you run this, not
// hardcoded, so the overdue/due-today/due-later spread stays meaningful
// no matter when you run it.
//
// Also seeds a few tasks with NO due date, to exercise the "No Deadline
// — Do This Next" section (weight-only ranking via rankByWeight in
// data/rankTasks.js) — the original version of this script predated that
// section and only covered the due-date decision.

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Mirrors hooks/useWeightCalculator.js exactly — the API doesn't compute
// weight server-side, it's expected on the request body (see
// pages/api/tasks/index.js), same as WeightingForm.js does.
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
  console.log(`Seeding ${TASKS.length} test tasks against ${BASE_URL} ...\n`)

  for (const task of TASKS) {
    const weight = computeWeight(task.priority, task.effort)
    const body = { ...task, weight }

    try {
      const response = await fetch(`${BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`✗ ${task.title} — ${response.status} ${errorText}`)
        continue
      }

      const created = await response.json()
      console.log(`✓ ${created.title} — weight ${weight}, due ${created.dueDate || 'no due date'}`)
    } catch (error) {
      console.error(`✗ ${task.title} — request failed:`, error.message)
      console.error('  Is `npm run dev` running? Is BASE_URL correct?')
    }
  }

  console.log('\nDone. Refresh Smart Start to see the new decision.')
  console.log('To remove these again: node scripts/remove-seeded-test-tasks.mjs')
}

// Exported so remove-seeded-test-tasks.mjs can match on the exact same
// titles instead of keeping its own copy of this list that could drift.
export { TASKS }

// Only auto-run when executed directly (`node scripts/seed-test-tasks.mjs`),
// not when imported by the cleanup script.
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
}
