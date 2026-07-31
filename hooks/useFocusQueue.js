// See components/shared/FocusQueue.js for ownership/placement notes —
// not yet assigned in the handoff doc.

import { useEffect, useState } from 'react'

const MAX_QUEUE_SIZE = 3

export function useFocusQueue() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: fetch from /api/tasks, sort by weight (and likely dueDate /
    // recommendedStart), and slice to the top 1-3 per the doc's spec.
    setTasks([])
    setLoading(false)
  }, [])

  return { tasks: tasks.slice(0, MAX_QUEUE_SIZE), loading }
}
