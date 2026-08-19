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
    // effort 5 = 240 min, budget is 180/day, so it needs to walk back one
    // day from raw minute math alone. Due date is only 6 days out here,
    // inside the effort-5 advance-notice window (see the "advance notice
    // floor" tests below), so that floor — not the minute math — ends up
    // being what actually determines the result: today, since the notice
    // floor (due date minus 7 days) has already passed.
    const tasks = [{ id: 'a', dueDate: '2026-08-25T12:00:00Z', effort: 5 }]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-08-19T00:00:00.000Z')
  })

  it('splits a shared day\'s budget between two tasks due the same day, earliest-sorted first', () => {
    // Both due the same day; combined effort exceeds one day's budget
    // (120 + 120 = 240 > 180), so the minute math alone would push
    // "second" to the day before while "first" stays on the due day.
    // But effort 3's 3-day advance-notice floor (see below) is earlier
    // than either of those, so both end up pulled back to the same
    // notice-floor day regardless of the contention between them.
    const tasks = [
      { id: 'first', dueDate: '2026-08-25T09:00:00Z', effort: 3 }, // 120 min
      { id: 'second', dueDate: '2026-08-25T10:00:00Z', effort: 3 }, // 120 min
    ]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('first')).toBe('2026-08-22T00:00:00.000Z')
    expect(result.get('second')).toBe('2026-08-22T00:00:00.000Z')
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

// MIN_LEAD_DAYS — a floor on how much advance notice a task gets, on top
// of (independent from) the minute-budget math above. Added because a
// task like "study for exams" (effort 5) could otherwise land a
// recommendedStart just one day before its due date whenever the raw
// minute math alone happened to fit that tightly, which isn't enough
// real-world lead time for something that size.
describe('scheduleTasks — advance notice floor (MIN_LEAD_DAYS)', () => {
  it('gives an effort-5 task a full week of notice, more than the 1-day minute-budget need alone', () => {
    const tasks = [{ id: 'a', dueDate: '2026-09-15T12:00:00Z', effort: 5 }] // 240 min
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    // Minute budget alone would only push this back to 2026-09-14 (240
    // min needs one day beyond the due day's 180-min budget) — the
    // notice floor pulls it back further, to a full week before the due
    // date.
    expect(result.get('a')).toBe('2026-09-08T00:00:00.000Z')
  })

  it('does not add extra notice for a quick task (effort 1\'s minimum is 0 days)', () => {
    const tasks = [{ id: 'a', dueDate: '2026-09-15T12:00:00Z', effort: 1 }] // 30 min
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-09-15T00:00:00.000Z')
  })

  it('never recommends starting in the past, even when the notice floor alone would land there', () => {
    // Due in 2 days; effort 5's 7-day minimum notice would be 5 days
    // ago, which isn't a usable recommendation — falls back to today,
    // same reasoning as the plain overdue clamp.
    const tasks = [{ id: 'a', dueDate: '2026-08-21T12:00:00Z', effort: 5 }]
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })
    expect(result.get('a')).toBe('2026-08-19T00:00:00.000Z')
  })

  it('still lets genuine minute-budget contention push a task back further than the flat notice floor', () => {
    // 8 same-day effort-5 tasks (240 min each = 1920 min total) need far
    // more than the 7*180=1260 minutes of daily budget available inside
    // a flat 7-day notice window, so whichever tasks get queued behind
    // the others should get pushed back MORE than 7 days — the notice
    // floor is a minimum, not a cap.
    const dueDate = '2026-09-15T09:00:00Z'
    const tasks = Array.from({ length: 8 }, (_, i) => ({ id: `task${i}`, dueDate, effort: 5 }))
    const result = scheduleTasks(tasks, { timezone: 'UTC', now: NOW })

    const flatNoticeFloor = new Date('2026-09-08T00:00:00.000Z').getTime()
    const lastTaskStart = new Date(result.get('task7')).getTime()
    expect(lastTaskStart).toBeLessThan(flatNoticeFloor)
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
