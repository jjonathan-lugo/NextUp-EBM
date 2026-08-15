// Owner: Malika

import { useState } from 'react'
import Button from '../Button'

export default function PhoneTimeLogger() {
  const [minutes, setMinutes] = useState('')
  const [message, setMessage] = useState('')

  async function handleLog() {
    const phoneMinutes = Number(minutes)

    if (!Number.isFinite(phoneMinutes) || phoneMinutes < 0) {
      setMessage('Please enter a valid number of minutes.')
      return
    }

    try {
      const response = await fetch('/api/phone-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minutes: phoneMinutes,
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save phone time')
      }

      setMinutes('')
      setMessage('Phone time logged successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Could not save phone time.')
    }
  }

  return (
    <section>
      <h2>Log Phone Time</h2>

      <input
        type="number"
        min="0"
        value={minutes}
        placeholder="Minutes"
        onChange={(e) => setMinutes(e.target.value)}
      />

      <Button onClick={handleLog}>
        Log
      </Button>

      {message && <p>{message}</p>}
    </section>
  )
}
