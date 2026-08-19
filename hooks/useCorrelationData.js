// Owner: Malika
//
// v1 bug: computed completed-task count ONCE across the user's entire
// task history and stamped that same single number onto every
// phone-time entry regardless of date — a phone-time entry from three
// weeks ago and one from today were compared against the identical
// number.
//
// v2 bug: fixed the above by bucketing completed tasks by day and
// matching each entry to its own day's count — but a phone-time entry is
// logged per button-press (see PhoneTimeLogger.js), not once a day. A
// user logging 5 times in one day got 5 rows all showing that day's
// full completed-task count, including entries logged *before* any task
// was actually completed that day, which reads as if the count changed
// retroactively.
//
// v3 (current): aggregates same-day phone-time entries into a single
// row — summed minutes for the day — before correlating against that
// day's completed-task count. One row per day, matching the feature's
// original framing ("days with more phone time tend to..."), and no
// single day's task count gets effectively double/triple-counted across
// several log entries.
//
// There's no dedicated "completedAt" field on the Task model
// (data/models/Task.js), so a task's updatedAt is used as the best
// available completion-date proxy — it's set whenever a task is
// updated, and marking a task done (see TaskPicker.js's handleMarkDone)
// is a normal update, so in practice this is the completion timestamp
// unless a task is edited again *after* being marked done, which would
// shift its bucketed day to the edit instead.
import { useEffect, useState } from 'react'
import { useTimezone } from './useTimezone'
import { zonedDayKey } from '../data/timezone'
import { authFetch } from '../data/authFetch'

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
          authFetch('/api/phone-time'),
          authFetch('/api/tasks'),
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

        const phoneMinutesByDay = {}
        for (const entry of phoneEntries) {
          const dayKey = zonedDayKey(entry.date, timezone)
          phoneMinutesByDay[dayKey] = (phoneMinutesByDay[dayKey] || 0) + entry.minutes
        }

        const correlationData = Object.keys(phoneMinutesByDay)
          .sort()
          .map((dayKey) => ({
            date: dayKey,
            phoneMinutes: phoneMinutesByDay[dayKey],
            completedTasks: completedByDay[dayKey] || 0,
          }))

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
