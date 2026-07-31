// Owner: Grace
import { useEffect, useState } from 'react'

export function useStartTimeAlgorithm() {
  const [recommendedTime, setRecommendedTime] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO(G): call /api/start-time and set the recommendation.
    // Doc flags this as the hardest part of the app: needs to reason about
    // "realistic time available" — does it check other scheduled tasks,
    // or just divide remaining days until dueDate? Prototype the logic on
    // paper before coding.
    setLoading(false)
  }, [])

  return { recommendedTime, loading }
}
