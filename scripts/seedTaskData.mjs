// The actual task data seed-test-tasks.mjs writes to Supabase, pulled
// out into its own module with no side effects (no env loading, no
// Supabase client, no USER_ID requirement) — importing THIS is always
// safe. seed-test-tasks.mjs used to export TASKS itself so
// remove-seeded-test-tasks.mjs could match on the same titles, but that
// meant importing TASKS also ran seed-test-tasks.mjs's top-level
// USER_ID check, which made the cleanup script fail immediately for
// anyone using EMAIL instead of USER_ID (or no env at all yet).
//
// Due dates are computed relative to whenever this is imported, not
// hardcoded, so the overdue/due-today/due-later spread stays meaningful
// no matter when seed-test-tasks.mjs actually runs.
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
export const TASKS = [
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
