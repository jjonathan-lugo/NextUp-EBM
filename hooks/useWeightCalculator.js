// Owner: Jonathan Lugo
import { useCallback, useState } from 'react'

export function useWeightCalculator() {
  const [weight, setWeight] = useState(null)

  const calculate = useCallback(({ effort, priority }) => {
    // TODO(J): implement the real formula. Doc frames this as an
    // Eisenhower Matrix (urgent/important) with effort as a third axis —
    // a naive sum is probably not right. Stretch goal: let effort
    // estimates self-correct over time using timeSpentSeconds vs. the
    // original effort score (planning fallacy).
    const result = null
    setWeight(result)
    return result
  }, [])

  return { weight, calculate }
}
