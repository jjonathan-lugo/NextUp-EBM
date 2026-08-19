// Owner: Malika
//
// Takes hours and minutes as separate inputs instead of a single
// "minutes" field, so logging doesn't require mentally converting (e.g.
// "2 hours 30 minutes" used to mean typing 150). The API and storage are
// unchanged — still a single total-minutes number (see
// data/phoneTimeStore.js) — this just combines the two fields before
// sending.
//
// Both are <select> dropdowns instead of number inputs — picking a
// value is faster and can't produce an invalid one (no empty field, no
// negative number, no typo), unlike a free-text number input.
import { useState } from 'react'
import Button from '../Button'
import { authFetch } from '../../data/authFetch'
import styles from '../../styles/phone-correlation.module.css'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, ... 55

export default function PhoneTimeLogger() {
  const [hours, setHours] = useState('0')
  const [minutes, setMinutes] = useState('0')
  const [message, setMessage] = useState('')

  async function handleLog() {
    const hoursValue = Number(hours)
    const minutesValue = Number(minutes)
    const totalMinutes = hoursValue * 60 + minutesValue

    if (totalMinutes <= 0) {
      setMessage('Select some time before logging.')
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

      setHours('0')
      setMinutes('0')
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
          <select value={hours} onChange={(e) => setHours(e.target.value)}>
            {HOUR_OPTIONS.map((hour) => (
              <option key={hour} value={hour}>{hour}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          Minutes
          <select value={minutes} onChange={(e) => setMinutes(e.target.value)}>
            {MINUTE_OPTIONS.map((minute) => (
              <option key={minute} value={minute}>{minute}</option>
            ))}
          </select>
        </label>

        <Button onClick={handleLog}>
          Log
        </Button>
      </div>

      {message && <p className={styles.message}>{message}</p>}
    </section>
  )
}
