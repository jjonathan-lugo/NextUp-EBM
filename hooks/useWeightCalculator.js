// Owner: Jonathan Lugo
import { useCallback, useState } from 'react'
import { computeWeight } from '../data/weightFormula'

// Confirmed formula (was a placeholder — settled 2026-08-19), now shared
// with pages/api/weighting.js via data/weightFormula.js so client and
// server can't drift. Due-date urgency is handled separately by the
// ranking system (data/rankTasks.js), so this only needs to capture the
// importance-vs-effort trade-off, not a full Eisenhower urgent/important
// matrix.
export function useWeightCalculator() {
  const [weight, setWeight] = useState(null)

  const calculate = useCallback(({ effort, priority }) => {
    // TODO(J): planning-fallacy stretch goal — let effort estimates
    // self-correct over time using timeSpentSeconds vs. the original
    // effort score. Not implemented here.
    const result = computeWeight(priority, effort)
    setWeight(result)
    return result
  }, [])

  return { weight, calculate }
}
