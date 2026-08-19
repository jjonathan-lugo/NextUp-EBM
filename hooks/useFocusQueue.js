// Backs components/shared/FocusQueue.js — MVP feature #4, no assigned
// owner yet (see that file's comment). Combines the shared task list with
// the weighting engine's output to surface only the top few tasks instead
// of a full list, per the choice-overload framing in the handoff doc.
//
// Now uses the same ranking as Smart Start's decision (data/rankTasks.js)
// — urgency (overdue / due today / needs today's budget) beats weight,
// weight breaks ties — instead of sorting by weight alone. Team decision:
// the two features should agree, so this queue actually reshuffles as due
// dates approach or pass, not just when a task's weight changes, and
// naturally drops a task the moment it's marked done or deleted (both
// re-fetch on next mount, e.g. navigating back to the homepage).
import { useEffect, useState } from 'react'
import { useTimezone } from './useTimezone'
import { rankTasks } from '../data/rankTasks'
import { fetchRecommendations } from '../data/fetchRecommendations'

const MAX_QUEUE_SIZE = 3

export function useFocusQueue() {
  const { timezone } = useTimezone()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadQueue() {
      setLoading(true)
      try {
        const response = await fetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Could not load tasks')
        }
        const allTasks = await response.json()

        let recommendations = {}
        try {
          recommendations = await fetchRecommendations(timezone)
        } catch (error) {
          // A recommendation-fetch failure shouldn't block the queue
          // entirely — tasks without a due date already rank fine on
          // weight alone (see urgencyTier's LATER fallback), so degrade
          // gracefully instead of showing nothing.
          console.error('Failed to load start-time recommendations:', error)
        }

        if (!cancelled) {
          const queue = rankTasks(allTasks, recommendations, timezone).slice(0, MAX_QUEUE_SIZE)
          setTasks(queue)
        }
      } catch (error) {
        console.error('Failed to load focus queue:', error)
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadQueue()

    return () => {
      cancelled = true
    }
  }, [timezone])

  return { tasks, loading }
}
