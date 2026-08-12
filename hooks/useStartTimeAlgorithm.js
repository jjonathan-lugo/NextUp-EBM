// Owner: Grace
import { useEffect, useState } from 'react'

export function useStartTimeAlgorithm() {
  const [recommendedTime, setRecommendedTime] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function getRecommendedTime() {
      try {
        const response = await fetch('/api/start-time')
        const data = await response.json()

        setRecommendedTime(data.recommendedTime)
      } catch (error) {
        console.error('Failed to get recommended start time:', error)
      } finally {
        setLoading(false)
      }
    }

    getRecommendedTime()
  }, [])

  return { recommendedTime, loading }
}