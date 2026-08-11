// Owner: Jonathan Lugo
import { useCallback, useState } from 'react'

// v1 formula — a placeholder judgment call, NOT the team's agreed-on
// Eisenhower-style formula from the doc. Weights priority higher than
// effort (3:1) and is scaled to land in the same 2-10 range as the old
// naive-sum placeholder, so TaskWeightBar's max={10} in WeightingForm.js
// still holds. Revisit as a team before treating this as final.
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
