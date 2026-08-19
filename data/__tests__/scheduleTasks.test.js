import { scheduleTasks, getSameDayStartTime } from '../scheduleTasks'

// A fixed "now" so every test is deterministic regardless of when it runs.
// Wednesday, Aug 19 2026, 9am UTC.
const NOW = new Date('2026-08-19T09:00:00Z')

describe('scheduleTasks', () => {
  it('recommends the due date itself when a single low-effort task fits its own day', () => {
    const tasks = [{ id: 'a', dueDate: '2026-08-25T12:00:00Z', effort: 1 }] // 30 min
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-08-25T00:00:00.000Z')
  })

  it('clamps an overdue task straight to today, not the (past) due date', () => {
    const tasks = [{ id: 'a', dueDate: '2026-08-10T12:00:00Z', effort: 2 }]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    // today (UTC) is 2026-08-19T00:00:00Z
    expect(result.get('a')).toBe('2026-08-19T00:00:00.000Z')
  })

  it('pushes recommendedStart earlier when a task needs more than one day\'s budget', () => {
    // effort 5 = 240 min, budget is 180/day, so it needs to walk back one day.
    const tasks = [{ id: 'a', dueDate: '2026-08-25T12:00:00Z', effort: 5 }]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-08-24T00:00:00.000Z')
  })

  it('splits a shared day\'s budget between two tasks due the same day, earliest-sorted first', () => {
    // Both due the same day; combined effort exceeds one day's budget
    // (120 + 120 = 240 > 180), so the scheduler should push one of them
    // to the day before. Sort is by due date, and these tie, so array
    // order after the stable due-date sort determines who claims the
    // day first.
    const tasks = [
      { id: 'first', dueDate: '2026-08-25T09:00:00Z', effort: 3 }, // 120 min
      { id: 'second', dueDate: '2026-08-25T10:00:00Z', effort: 3 }, // 120 min
    ]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    // "first" has the earlier due timestamp, so it's processed first and
    // claims the full 120 min out of that day's 180, leaving 60 for
    // "second" (needs 120), pushing it back one day.
    expect(result.get('first')).toBe('2026-08-25T00:00:00.000Z')
    expect(result.get('second')).toBe('2026-08-24T00:00:00.000Z')
  })

  it('clamps to today (not further back) when a task due today exceeds a full day\'s budget', () => {
    // Due today, needs 240 min (effort 5) — more than the whole 180-min
    // daily budget. Walking back one more day would land in the past,
    // which the scheduler explicitly refuses to do; it should give up
    // and say "start now" (today) instead of recommending a start time
    // that's already behind us.
    const tasks = [{ id: 'a', dueDate: '2026-08-19T20:00:00Z', effort: 5 }]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-08-19T00:00:00.000Z')
  })

  it('is timezone-aware: the "today" clamp differs from the UTC-bucketed answer', () => {
    // 2026-08-19T09:00:00Z is 2026-08-19T05:00 in New York (EDT, UTC-4) —
    // still Aug 19 locally too, so use a due date deep enough in the past
    // that both zones agree it's overdue, and confirm "today" is computed
    // in the given zone rather than UTC.
    const tasks = [{ id: 'a', dueDate: '2026-08-10T12:00:00Z', effort: 1 }]
    const result = scheduleTasks(tasks, { timezone: 'America/New_York', now: NOW })
    // Today at NY midnight (EDT, UTC-4) is 2026-08-19T04:00:00Z.
    expect(result.get('a')).toBe('2026-08-19T04:00:00.000Z')
  })

  it('handles an empty task list', () => {
    const result = scheduleTasks([], { timezone: 'UTC', now: NOW })
    expect(result.size).toBe(0)
  })
})

describe('getSameDayStartTime', () => {
  it('suggests a clock time before the due time, based on estimated effort duration', () => {
    const dueDate = '2026-08-19T15:00:00Z'
    const result = getSameDayStartTime({ dueDate, effort: 2, now: NOW }) // 60 min
    expect(result.toISOString()).toBe('2026-08-19T14:00:00.000Z')
  })

  it('falls back to "now" when the ideal start time has already passed', () => {
    const dueDate = '2026-08-19T09:20:00Z' // only 20 min after NOW
    const result = getSameDayStartTime({ dueDate, effort: 3, now: NOW }) // needs 120 min
    expect(result.toISOString()).toBe(NOW.toISOString())
  })
})
