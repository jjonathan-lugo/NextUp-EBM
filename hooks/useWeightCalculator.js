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
    // Still no self-correction HERE — the effort score fed into the
    // weight formula stays exactly what the user typed. A related,
    // narrower version of the planning-fallacy idea now exists in
    // data/adaptiveThreshold.js: Focus Timer's Adaptive mode personalizes
    // its break-nudge threshold from actual timeSpentSeconds history, but
    // deliberately doesn't feed back into the effort score or weight
    // itself — see that file's comment for why. Actually adjusting the
    // effort number a task is scored at (not just the nudge timing) is
    // still an open stretch goal.
    const result = computeWeight(priority, effort)
    setWeight(result)
    return result
  }, [])

  return { weight, calculate }
}
