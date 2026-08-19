import { computeWeight, PRIORITY_WEIGHT, EFFORT_WEIGHT } from '../weightFormula'

describe('computeWeight', () => {
  it('matches the documented formula: priority*1.5 + effort*0.5', () => {
    expect(computeWeight(3, 2)).toBe(3 * PRIORITY_WEIGHT + 2 * EFFORT_WEIGHT)
  })

  it('weights priority 3x more heavily than effort', () => {
    // Same total (5 either way), but priority should win.
    const priorityHeavy = computeWeight(5, 1) // 5*1.5 + 1*0.5 = 8
    const effortHeavy = computeWeight(1, 5) // 1*1.5 + 5*0.5 = 4
    expect(priorityHeavy).toBeGreaterThan(effortHeavy)
  })

  it('produces the documented 2-10 range at the 1-5 input boundaries', () => {
    expect(computeWeight(1, 1)).toBe(2) // 1.5 + 0.5
    expect(computeWeight(5, 5)).toBe(10) // 7.5 + 2.5
  })

  it('produces exact multiples of 0.5 for the integer 1-5 inputs the UI actually sends', () => {
    expect(computeWeight(3, 3)).toBe(6) // 4.5 + 1.5
    expect(computeWeight(2, 3)).toBe(4.5) // 3 + 1.5
  })

  it('rounds to one decimal place for non-integer input', () => {
    // Integer inputs 1-5 can only ever land on multiples of 0.5, so
    // this exercises the Math.round(...*10)/10 guard with a case that
    // would otherwise produce floating-point noise past one decimal.
    expect(computeWeight(2.33, 3.1)).toBeCloseTo(5.0, 5)
  })
})
