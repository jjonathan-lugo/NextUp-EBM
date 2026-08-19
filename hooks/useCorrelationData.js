// Owner: Malika
//
// Bug fix: this used to compute completed-task count ONCE across the
// user's entire task history (`tasks.filter(status === 'done').length`)
// and then stamp that same single number onto every phone-time entry,
// regardless of that entry's date. That made the correlation math
// meaningless — a phone-time entry from three weeks ago and one from
// today would be compared against the identical "completed tasks"
// number, so any real day-to-day relationship between phone use and
// task completion couldn't show up.
//
// Fixed to bucket completed tasks by the calendar day they were
// completed and match each phone-time entry against its own day's count.
// There's no dedicated "completedAt" field on the Task model
// (data/models/Task.js), so updatedAt is used as the best available
// completion-date proxy — it's set whenever a task is updated, and
// marking a task done (see TaskPicker.js's handleMarkDone) is a normal
// update, so in practice this is the completion timestamp unless a task
// is edited again *after* being marked done, which would shift its
// bucketed day to the edit instead.
import { useEffect, useState } from 'react'
import { useTimezone } from './useTimezone'
import { zonedDayKey } from '../data/timezone'

export function useCorrelationData() {
  const { timezone } = useTimezone()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function loadCorrelationData() {
      setLoading(true)
      try {
        const [phoneResponse, tasksResponse] = await Promise.all([
          fetch('/api/phone-time'),
          fetch('/api/tasks'),
        ])

        if (!phoneResponse.ok) {
          throw new Error('Could not load phone-time data')
        }

        if (!tasksResponse.ok) {
          throw new Error('Could not load task data')
        }

        const phoneEntries = await phoneResponse.json()
        const tasks = await tasksResponse.json()

        const completedByDay = {}
        for (const task of tasks) {
          if (task.status !== 'done' || !task.updatedAt) continue
          const dayKey = zonedDayKey(task.updatedAt, timezone)
          completedByDay[dayKey] = (completedByDay[dayKey] || 0) + 1
        }

        const correlationData = phoneEntries.map((entry) => {
          const dayKey = zonedDayKey(entry.date, timezone)
          return {
            date: entry.date,
            phoneMinutes: entry.minutes,
            completedTasks: completedByDay[dayKey] || 0,
          }
        })

        if (!cancelled) setData(correlationData)
      } catch (error) {
        console.error('Failed to load correlation data:', error)
        if (!cancelled) setData([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadCorrelationData()

    return () => {
      cancelled = true
    }
  }, [timezone])

  return {
    data,
    loading,
  }
}
