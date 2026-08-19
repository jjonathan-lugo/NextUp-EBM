// Backward greedy day-budget scheduler — the "real" version of the Smart
// Start algorithm. Unlike the old per-task heuristic (dueDate minus a
// fixed buffer), this looks at ALL pending tasks together and divides a
// shared daily focus-time budget among them, earliest-due-date first, so
// tasks competing for the same days push each other's recommended start
// times earlier instead of being computed in isolation.
//
// Two constants below were explicit team decisions, not guesses:
// - DAILY_BUDGET_MINUTES: assumed realistic daily focus time.
// - Tie-break rule: earliest due date claims a contested day first.
//
// Buckets days by a real timezone (data/timezone.js), not UTC. An
// earlier version zeroed to UTC midnight — that broke the same-day
// suggestion feature, since UTC midnight falls on the *previous*
// calendar day for anyone west of UTC (most of the Americas), so a task
// due this evening would almost never register as "due today."
import { startOfZonedDay, zonedDayKey, addZonedDays } from './timezone'

const DAILY_BUDGET_MINUTES = 180 // 3 hours/day
const MAX_LOOKBACK_DAYS = 90 // safety cap against runaway loops

// Rough effort -> estimated-duration mapping, same spirit as the fixed
// per-effort-level thresholds already used in AdaptiveMode.js, but this
// is a distinct scale (duration estimate, not a diminishing-returns cutoff).
const EFFORT_TO_MINUTES = {
  1: 30,
  2: 60,
  3: 120,
  4: 180,
  5: 240,
}

function estimatedMinutes(effort) {
  const clamped = Math.max(1, Math.min(5, effort))
  return EFFORT_TO_MINUTES[clamped]
}

// tasks: array of { id, dueDate, effort } — caller is expected to have
// already filtered to non-done tasks with a real dueDate.
// timezone: IANA name to bucket days by; defaults to UTC if not given.
// now: injectable for testing; defaults to the real current time.
// Returns a Map of taskId -> recommendedStart (ISO string).
export function scheduleTasks(tasks, { timezone = 'UTC', now = new Date() } = {}) {
  const dailyRemaining = new Map()
  const results = new Map()
  const today = startOfZonedDay(now, timezone)

  const sorted = [...tasks].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  )

  for (const task of sorted) {
    let remainingMinutes = estimatedMinutes(task.effort)
    let cursor = startOfZonedDay(task.dueDate, timezone)

    // If the due date's own day has already passed (task is overdue),
    // there's nothing to walk back from — clamp straight to today. The
    // loop below only clamped when walking back INTO the past across
    // multiple days; it never checked whether the very first day (the
    // due date itself) was already behind "now".
    if (cursor < today) {
      cursor = today
    }

    let recommendedStart = cursor
    let daysWalked = 0

    while (remainingMinutes > 0 && daysWalked < MAX_LOOKBACK_DAYS) {
      const dayKey = zonedDayKey(cursor, timezone)
      const available = dailyRemaining.has(dayKey)
        ? dailyRemaining.get(dayKey)
        : DAILY_BUDGET_MINUTES

      const used = Math.min(available, remainingMinutes)
      dailyRemaining.set(dayKey, available - used)
      remainingMinutes -= used
      recommendedStart = cursor

      if (remainingMinutes > 0) {
        cursor = addZonedDays(cursor, -1, timezone)
        daysWalked += 1

        // Can't schedule into the past — if a task needs more time than
        // is left between now and its due date, it's already overbooked;
        // the honest answer is "start now."
        if (cursor < today) {
          recommendedStart = today
          break
        }
      }
    }

    results.set(task.id, recommendedStart.toISOString())
  }

  return results
}

// When the day-level scheduler above lands a task's recommended start on
// the SAME calendar day as its due date (i.e. it fits without needing to
// push into an earlier day) and that day is today, a specific clock time
// is more useful than just "today".
export function getSameDayStartTime({ dueDate, effort, now = new Date() }) {
  const neededMs = estimatedMinutes(effort) * 60 * 1000
  const suggested = new Date(new Date(dueDate).getTime() - neededMs)
  return suggested < now ? now : suggested
}
