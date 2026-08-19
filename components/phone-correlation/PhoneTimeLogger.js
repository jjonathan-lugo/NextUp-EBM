// Owner: Malika
//
// Takes hours and minutes as separate inputs instead of a single
// "minutes" field, so logging doesn't require mentally converting (e.g.
// "2 hours 30 minutes" used to mean typing 150). The API and storage are
// unchanged — still a single total-minutes number (see
// data/phoneTimeStore.js) — this just combines the two fields before
// sending.
import { useState } from 'react'
import Button from '../Button'
import { authFetch } from '../../data/authFetch'
import styles from '../../styles/phone-correlation.module.css'

export default function PhoneTimeLogger() {
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [message, setMessage] = useState('')

  async function handleLog() {
    const hoursValue = hours === '' ? 0 : Number(hours)
    const minutesValue = minutes === '' ? 0 : Number(minutes)

    if (
      !Number.isFinite(hoursValue) ||
      hoursValue < 0 ||
      !Number.isFinite(minutesValue) ||
      minutesValue < 0
    ) {
      setMessage('Please enter a valid number of hours and/or minutes.')
      return
    }

    const totalMinutes = hoursValue * 60 + minutesValue

    if (totalMinutes <= 0) {
      setMessage('Enter some time before logging.')
      return
    }

    try {
      const response = await authFetch('/api/phone-time', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          minutes: totalMinutes,
          date: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save phone time')
      }

      setHours('')
      setMinutes('')
      setMessage('Phone time logged successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Could not save phone time.')
    }
  }

  return (
    <section className={styles.card}>
      <h2>Log Phone Time</h2>

      <div className={styles.loggerFields}>
        <label className={styles.field}>
          Hours
          <input
            type="number"
            min="0"
            value={hours}
            placeholder="0"
            onChange={(e) => setHours(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          Minutes
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            placeholder="0"
            onChange={(e) => setMinutes(e.target.value)}
          />
        </label>

        <Button onClick={handleLog}>
          Log
        </Button>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </section>
  )
}
