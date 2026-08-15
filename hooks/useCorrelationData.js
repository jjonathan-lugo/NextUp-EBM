// Owner: Malika

import { useEffect, useState } from 'react'

export function useCorrelationData() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/phone-time')

        if (!response.ok) {
          throw new Error('Failed to fetch phone-time data')
        }

        const phoneData = await response.json()

        const correlationData = phoneData.map((item) => ({
          date: item.date,
          phoneMinutes: Number(item.phoneMinutes),
          completedTasks: Number(item.completedTasks)
        }))

        setData(correlationData)
      } catch (error) {
        console.error('Could not load correlation data:', error)

        // Demo data for development
        setData([
          {
            date: '2026-08-01',
            phoneMinutes: 180,
            completedTasks: 4
          },
          {
            date: '2026-08-02',
            phoneMinutes: 150,
            completedTasks: 5
          },
          {
            date: '2026-08-03',
            phoneMinutes: 220,
            completedTasks: 3
          },
          {
            date: '2026-08-04',
            phoneMinutes: 120,
            completedTasks: 7
          },
          {
            date: '2026-08-05',
            phoneMinutes: 200,
            completedTasks: 4
          }
        ])
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return {
    data,
    loading
  }
}
