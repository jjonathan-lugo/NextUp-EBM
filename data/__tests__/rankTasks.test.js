// rankTasks() reads the real current time internally (`new Date()`),
// unlike scheduleTasks() which takes an injectable `now` — so these
// tests build due dates relative to Date.now() (same pattern as
// scripts/seed-test-tasks.mjs) rather than hardcoding absolute dates,
// so they don't silently rot as the calendar moves on.
import { URGENCY, urgencyTier, rankTasks, rankByWeight } from '../rankTasks'
import { startOfZonedDay } from '../timezone'

const TIMEZONE = 'UTC'

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
}

// Fixed hour within TODAY's zoned day — safer than "N hours from now"
// for anything meant to land on today, since that can tip into
// tomorrow if the suite happens to run within a few hours of midnight
// UTC. Anchoring off startOfZonedDay guarantees "today" regardless of
// what time the test actually runs.
function todayAt(hour) {
  const midnight = startOfZonedDay(new Date(), TIMEZONE)
  return new Date(midnight.getTime() + hour * 60 * 60 * 1000).toISOString()
}

describe('urgencyTier', () => {
  it('returns LATER for a task with no due date', () => {
    const tier = urgencyTier({ dueDate: null }, undefined, new Date().toISOString(), TIMEZONE)
    expect(tier).toBe(URGENCY.LATER)
  })

  it('returns OVERDUE when the recommendation says so, regardless of the raw due date', () => {
    const task = { dueDate: daysFromNow(5) } // due date itself is in the future
    const recommendation = { isOverdue: true }
    const tier = urgencyTier(task, recommendation, new Date().toISOString(), TIMEZONE)
    expect(tier).toBe(URGENCY.OVERDUE)
  })

  it('returns DUE_TODAY when the due date falls on today, zoned', () => {
    const task = { dueDate: todayAt(12) }
    const tier = urgencyTier(task, undefined, new Date().toISOString(), TIMEZONE)
    expect(tier).toBe(URGENCY.DUE_TODAY)
  })

  it('returns NEEDS_TODAY when due later but the scheduler says work must start today', () => {
    const task = { dueDate: daysFromNow(3) }
    const recommendation = { recommendedStart: todayAt(8) }
    const tier = urgencyTier(task, recommendation, new Date().toISOString(), TIMEZONE)
    expect(tier).toBe(URGENCY.NEEDS_TODAY)
  })

  it('returns LATER when due later and nothing needs to start today', () => {
    const task = { dueDate: daysFromNow(5) }
    const recommendation = { recommendedStart: daysFromNow(4) }
    const tier = urgencyTier(task, recommendation, new Date().toISOString(), TIMEZONE)
    expect(tier).toBe(URGENCY.LATER)
  })
})

describe('rankTasks', () => {
  it('excludes done tasks entirely', () => {
    const tasks = [
      { id: 'a', status: 'done', dueDate: daysFromNow(-1), weight: 10 },
      { id: 'b', status: 'pending', dueDate: daysFromNow(5), weight: 1 },
    ]
    const ranked = rankTasks(tasks, {}, TIMEZONE)
    expect(ranked.map((t) => t.id)).toEqual(['b'])
  })

  it('puts urgency ahead of weight across tiers', () => {
    const tasks = [
      { id: 'high-weight-later', status: 'pending', dueDate: daysFromNow(10), weight: 20 },
      { id: 'overdue-low-weight', status: 'pending', dueDate: daysFromNow(-2), weight: 1 },
    ]
    const recommendations = { 'overdue-low-weight': { isOverdue: true } }
    const ranked = rankTasks(tasks, recommendations, TIMEZONE)
    expect(ranked[0].id).toBe('overdue-low-weight')
    expect(ranked[1].id).toBe('high-weight-later')
  })

  it('breaks a same-tier tie by weight, highest first', () => {
    // Both far enough out to land safely in the LATER tier regardless
    // of exactly when the suite runs.
    const tasks = [
      { id: 'low', status: 'pending', dueDate: daysFromNow(10), weight: 3 },
      { id: 'high', status: 'pending', dueDate: daysFromNow(12), weight: 8 },
    ]
    const ranked = rankTasks(tasks, {}, TIMEZONE)
    expect(ranked.map((t) => t.id)).toEqual(['high', 'low'])
  })

  it('breaks a same-tier, same-weight tie by earliest due date', () => {
    const tasks = [
      { id: 'later', status: 'pending', dueDate: daysFromNow(12), weight: 5 },
      { id: 'sooner', status: 'pending', dueDate: daysFromNow(10), weight: 5 },
    ]
    const ranked = rankTasks(tasks, {}, TIMEZONE)
    expect(ranked.map((t) => t.id)).toEqual(['sooner', 'later'])
  })
})

describe('rankByWeight', () => {
  it('excludes done tasks', () => {
    const tasks = [
      { id: 'a', status: 'done', weight: 10, createdAt: daysFromNow(-5) },
      { id: 'b', status: 'pending', weight: 1, createdAt: daysFromNow(-1) },
    ]
    const ranked = rankByWeight(tasks)
    expect(ranked.map((t) => t.id)).toEqual(['b'])
  })

  it('sorts by weight, highest first', () => {
    const tasks = [
      { id: 'low', status: 'pending', weight: 2, createdAt: daysFromNow(-1) },
      { id: 'high', status: 'pending', weight: 9, createdAt: daysFromNow(-1) },
    ]
    const ranked = rankByWeight(tasks)
    expect(ranked.map((t) => t.id)).toEqual(['high', 'low'])
  })

  it('breaks a weight tie by earliest createdAt (oldest first)', () => {
    const tasks = [
      { id: 'newer', status: 'pending', weight: 4, createdAt: daysFromNow(-1) },
      { id: 'older', status: 'pending', weight: 4, createdAt: daysFromNow(-10) },
    ]
    const ranked = rankByWeight(tasks)
    expect(ranked.map((t) => t.id)).toEqual(['older', 'newer'])
  })
})
