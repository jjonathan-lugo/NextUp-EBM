// Mock the Supabase client before importing the component under test.
// CorrelationChart.js -> useCorrelationData -> authFetch -> supabaseClient,
// and supabaseClient.js calls createClient(...) at module load time —
// that would otherwise require real NEXT_PUBLIC_SUPABASE_URL/ANON_KEY
// env vars just to test pure correlation math that has nothing to do
// with Supabase. jest.mock is hoisted above the imports below, so the
// real supabaseClient.js never actually runs.
jest.mock('../../../data/supabaseClient', () => ({
  supabase: { auth: { getSession: async () => ({ data: {} }) } },
}))

import { calculateCorrelation, getStrength, formatDuration } from '../CorrelationChart'

describe('calculateCorrelation', () => {
  it('returns 0 when there are fewer than 2 data points', () => {
    expect(calculateCorrelation([])).toBe(0)
    expect(calculateCorrelation([{ phoneMinutes: 60, completedTasks: 2 }])).toBe(0)
  })

  it('returns 1 for a perfect positive linear relationship', () => {
    const data = [
      { phoneMinutes: 10, completedTasks: 1 },
      { phoneMinutes: 20, completedTasks: 2 },
      { phoneMinutes: 30, completedTasks: 3 },
    ]
    expect(calculateCorrelation(data)).toBeCloseTo(1, 10)
  })

  it('returns -1 for a perfect negative linear relationship', () => {
    const data = [
      { phoneMinutes: 10, completedTasks: 3 },
      { phoneMinutes: 20, completedTasks: 2 },
      { phoneMinutes: 30, completedTasks: 1 },
    ]
    expect(calculateCorrelation(data)).toBeCloseTo(-1, 10)
  })

  it('returns 0 when one variable never varies (zero variance)', () => {
    // Same completedTasks every day — no relationship is computable,
    // and this must not divide by zero / return NaN.
    const data = [
      { phoneMinutes: 10, completedTasks: 2 },
      { phoneMinutes: 20, completedTasks: 2 },
      { phoneMinutes: 30, completedTasks: 2 },
    ]
    expect(calculateCorrelation(data)).toBe(0)
  })

  it('returns a value between -1 and 1 for noisy real-world-shaped data', () => {
    const data = [
      { phoneMinutes: 45, completedTasks: 4 },
      { phoneMinutes: 120, completedTasks: 2 },
      { phoneMinutes: 30, completedTasks: 5 },
      { phoneMinutes: 200, completedTasks: 1 },
      { phoneMinutes: 90, completedTasks: 3 },
    ]
    const result = calculateCorrelation(data)
    expect(result).toBeGreaterThanOrEqual(-1)
    expect(result).toBeLessThanOrEqual(1)
  })
})

describe('getStrength', () => {
  it('classifies magnitude into the documented buckets', () => {
    expect(getStrength(0.1)).toBe('Very weak')
    expect(getStrength(-0.1)).toBe('Very weak') // sign shouldn't matter
    expect(getStrength(0.3)).toBe('Weak')
    expect(getStrength(0.5)).toBe('Moderate')
    expect(getStrength(0.9)).toBe('Strong')
    expect(getStrength(-0.9)).toBe('Strong')
  })

  it('treats the bucket boundaries correctly (exclusive upper bound)', () => {
    expect(getStrength(0.2)).toBe('Weak') // not "Very weak" at exactly 0.2
    expect(getStrength(0.4)).toBe('Moderate')
    expect(getStrength(0.7)).toBe('Strong')
  })
})

describe('formatDuration', () => {
  it('formats whole hours with no minutes remainder', () => {
    expect(formatDuration(120)).toBe('2h')
  })

  it('formats minutes-only durations under an hour', () => {
    expect(formatDuration(45)).toBe('45m')
  })

  it('formats a mixed hours-and-minutes duration', () => {
    expect(formatDuration(150)).toBe('2h 30m')
  })

  it('formats zero minutes', () => {
    expect(formatDuration(0)).toBe('0m')
  })
})
