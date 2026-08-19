// One-off script: adds 15 sample tasks straight into the `tasks` table
// via the Supabase service-role key (bypasses RLS, same approach the
// project's earlier seed scripts used before that folder got deleted).
//
// Doesn't import data/taskStore.js on purpose, even though its
// toRow()/toTask() do exactly this column mapping already — that file
// uses `export`/`import` syntax with no file extension on its own
// relative import (`from './models/Task'`), which only works because
// Next.js's bundler transpiles it. Running it under plain `node` (no
// "type": "module" in package.json, so a bare .js file is loaded as
// CommonJS) would fail with a SyntaxError on the `export` keyword. This
// script duplicates the small camelCase -> snake_case mapping inline
// instead of fighting that.
//
// Also: an earlier attempt at seeding via raw SQL in the Supabase SQL
// Editor tried to set a "user_id" column and failed with
// `column "user_id" of relation "tasks" does not exist` — so this does
// NOT set any per-user/owner column. If the tasks table does scope rows
// to a signed-in user under some other column name, these 15 rows will
// insert without an owner and may not show up tied to your account
// specifically.
//
// Usage:
//   node scripts/seedRandomTasks.mjs
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from './loadEnv.mjs'

loadEnv()

const SUPABASE_URL = process.env.SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

// weight is precomputed with the app's own formula (priority*1.5 +
// effort*0.5), see data/weightFormula.js — matches what the API would
// compute itself, so these rows look identical to ones the app created.
//
// Mix: 2 overdue, 2 due today, several due this/next week, 3 with no
// due date (exercises Smart Start's "No Deadline" section), and 2
// already marked done with time logged (exercises Adaptive mode's
// personalized threshold in data/adaptiveThreshold.js).
const TASKS = [
  { title: 'Finish CS 301 problem set',           effort: 4, priority: 5, weight: 9.5,  due_date: '2026-08-17T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Watch recorded lecture I missed',     effort: 2, priority: 2, weight: 4.0,  due_date: '2026-08-18T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Email professor about grade',         effort: 1, priority: 2, weight: 3.5,  due_date: '2026-08-19T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Renew library books',                 effort: 1, priority: 1, weight: 2.0,  due_date: '2026-08-19T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Group project outline',                effort: 3, priority: 4, weight: 7.5,  due_date: '2026-08-20T17:00:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Practice problems for chem lab',       effort: 3, priority: 3, weight: 6.0,  due_date: '2026-08-22T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Read chapters 5-6 for lit class',      effort: 3, priority: 3, weight: 6.0,  due_date: '2026-08-21T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Draft essay intro',                    effort: 2, priority: 3, weight: 5.5,  due_date: '2026-08-23T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Study for calculus exam',              effort: 5, priority: 5, weight: 10.0, due_date: '2026-08-26T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Register for next semester classes',   effort: 2, priority: 4, weight: 7.0,  due_date: '2026-08-29T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Apply for summer internship',          effort: 4, priority: 5, weight: 9.5,  due_date: '2026-09-02T23:59:00Z', status: 'todo', time_spent_seconds: 0 },
  { title: 'Clean up laptop desktop',              effort: 1, priority: 1, weight: 2.0,  due_date: null,                   status: 'todo', time_spent_seconds: 0 },
  { title: 'Organize class notes',                 effort: 2, priority: 2, weight: 4.0,  due_date: null,                   status: 'todo', time_spent_seconds: 0 },
  { title: 'Finish reading assignment',            effort: 3, priority: 4, weight: 7.5,  due_date: '2026-08-20T23:59:00Z', status: 'done', time_spent_seconds: 5400 },
  { title: 'Reply to group chat about meeting',    effort: 1, priority: 2, weight: 3.5,  due_date: null,                   status: 'done', time_spent_seconds: 300 },
]

function toRow(task) {
  return {
    title: task.title,
    description: '',
    effort: task.effort,
    priority: task.priority,
    weight: task.weight,
    due_date: task.due_date,
    status: task.status,
    time_spent_seconds: task.time_spent_seconds,
  }
}

async function main() {
  const { data, error } = await supabase
    .from('tasks')
    .insert(TASKS.map(toRow))
    .select()

  if (error) {
    console.error('Seeding failed:', error.message)
    process.exit(1)
  }

  for (const row of data) {
    console.log(`Added: ${row.title} (${row.id})`)
  }
  console.log(`Done — added ${data.length} tasks.`)
}

main()
