// Owner: Malika
import { useEffect, useState } from 'react'

export function useCorrelationData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO(M): fetch from /api/phone-time and correlate with task completion
    setLoading(false)
  }, [])

  return { data, loading }
}
