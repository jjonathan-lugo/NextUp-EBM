// Owner: Malika

import { useEffect, useState } from 'react'

export function useCorrelationData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCorrelationData() {
      try {
        const [phoneResponse, tasksResponse] =
          await Promise.all([
            fetch('/api/phone-time'),
            fetch('/api/tasks'),
          ])

        if (!phoneResponse.ok) {
          throw new Error('Could not load phone-time data')
        }

        if (!tasksResponse.ok) {
          throw new Error('Could not load task data')
        }

        const phoneEntries =
          await phoneResponse.json()

        const tasks =
          await tasksResponse.json()

        const completedTasks =
          tasks.filter(
            (task) => task.status === 'done'
          ).length

        const correlationData =
          phoneEntries.map((entry) => ({
            date: entry.date,
            phoneMinutes: entry.minutes,
            completedTasks,
          }))

        setData(correlationData)
      } catch (error) {
        console.error(
          'Failed to load correlation data:',
          error
        )

        setData([])
      } finally {
        setLoading(false)
      }
    }

    loadCorrelationData()
  }, [])

  return {
    data,
    loading,
  }
}
