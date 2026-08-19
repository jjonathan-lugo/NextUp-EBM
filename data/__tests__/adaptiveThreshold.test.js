import { defaultThresholdMinutes, personalizedThreshold } from '../adaptiveThreshold'

function doneTask(effort, timeSpentSeconds) {
  return { status: 'done', effort, timeSpentSeconds }
}

describe('defaultThresholdMinutes', () => {
  it('returns the documented generic minutes for each effort level', () => {
    expect(defaultThresholdMinutes(1)).toBe(10)
    expect(defaultThresholdMinutes(2)).toBe(15)
    expect(defaultThresholdMinutes(3)).toBe(25)
    expect(defaultThresholdMinutes(4)).toBe(35)
    expect(defaultThresholdMinutes(5)).toBe(45)
  })

  it('clamps out-of-range effort to 1-5', () => {
    expect(defaultThresholdMinutes(0)).toBe(defaultThresholdMinutes(1))
    expect(defaultThresholdMinutes(9)).toBe(defaultThresholdMinutes(5))
  })
})

describe('personalizedThreshold', () => {
  it('falls back to the default with no history at all', () => {
    const result = personalizedThreshold(3, [])
    expect(result).toEqual({ minutes: 25, personalized: false, sampleCount: 0 })
  })

  it('falls back to the default with only one sample (not enough to trust)', () => {
    const tasks = [doneTask(3, 40 * 60)]
    const result = personalizedThreshold(3, tasks)
    expect(result).toEqual({ minutes: 25, personalized: false, sampleCount: 1 })
  })

  it('personalizes once there are 2+ samples at that effort level', () => {
    // effort-3 tasks that actually took 40 and 44 minutes -> average 42
    const tasks = [doneTask(3, 40 * 60), doneTask(3, 44 * 60)]
    const result = personalizedThreshold(3, tasks)
    expect(result).toEqual({ minutes: 42, personalized: true, sampleCount: 2 })
  })

  it('only counts samples matching the requested effort level', () => {
    const tasks = [
      doneTask(3, 40 * 60),
      doneTask(3, 44 * 60),
      doneTask(5, 90 * 60), // different effort level, shouldn't count
    ]
    const result = personalizedThreshold(3, tasks)
    expect(result.sampleCount).toBe(2)
  })

  it('ignores not-done tasks, even with logged time', () => {
    // Only 1 valid (done) sample here, which is itself below
    // MIN_HISTORY_SAMPLES — falls back to the default, same as the
    // "only one sample" case above. The in-progress task's 44 minutes
    // must NOT be averaged in (that would produce a different result).
    const tasks = [
      doneTask(3, 40 * 60),
      { status: 'in_progress', effort: 3, timeSpentSeconds: 44 * 60 },
    ]
    const result = personalizedThreshold(3, tasks)
    expect(result).toEqual({ minutes: 25, personalized: false, sampleCount: 1 })
  })

  it('ignores done tasks with no logged time', () => {
    const tasks = [doneTask(3, 40 * 60), doneTask(3, 0), doneTask(3, null)]
    const result = personalizedThreshold(3, tasks)
    expect(result.sampleCount).toBe(1)
  })

  it('floors the personalized result so it can never drop below the minimum', () => {
    // Two very short effort-1 sessions (1 and 2 minutes) would average
    // 1.5 — the floor keeps this from being an unusably tiny threshold.
    const tasks = [doneTask(1, 60), doneTask(1, 120)]
    const result = personalizedThreshold(1, tasks)
    expect(result.minutes).toBe(5)
    expect(result.personalized).toBe(true)
  })

  it('rounds the average to the nearest minute', () => {
    // 10 and 11 minutes -> average 10.5 -> rounds to 11 (banker's-free
    // Math.round rounds .5 up)
    const tasks = [doneTask(2, 10 * 60), doneTask(2, 11 * 60)]
    const result = personalizedThreshold(2, tasks)
    expect(result.minutes).toBe(11)
  })

  it('clamps out-of-range effort the same way defaultThresholdMinutes does', () => {
    const result = personalizedThreshold(99, [])
    expect(result.minutes).toBe(defaultThresholdMinutes(5))
  })

  it('handles a missing/undefined historicalTasks argument gracefully', () => {
    const result = personalizedThreshold(3, undefined)
    expect(result).toEqual({ minutes: 25, personalized: false, sampleCount: 0 })
  })
})
