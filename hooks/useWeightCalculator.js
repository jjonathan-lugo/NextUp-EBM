// Owner: Jonathan Lugo
import { useCallback, useState } from 'react'

// Confirmed formula (was a placeholder — settled 2026-08-19). Due-date
// urgency is handled separately by the ranking system (data/rankTasks.js),
// so this only needs to capture the importance-vs-effort trade-off, not
// a full Eisenhower urgent/important matrix. Weights priority higher than
// effort (3:1) and is scaled to land in the 2-10 range so TaskWeightBar's
// max={10} in WeightingForm.js still holds.
const PRIORITY_WEIGHT = 1.5
const EFFORT_WEIGHT = 0.5

export function useWeightCalculator() {
  const [weight, setWeight] = useState(null)

  const calculate = useCallback(({ effort, priority }) => {
    // TODO(J): planning-fallacy stretch goal — let effort estimates
    // self-correct over time using timeSpentSeconds vs. the original
    // effort score. Not implemented here.
    const result = Math.round((priority * PRIORITY_WEIGHT + effort * EFFORT_WEIGHT) * 10) / 10
    setWeight(result)
    return result
  }, [])

  return { weight, calculate }
}
