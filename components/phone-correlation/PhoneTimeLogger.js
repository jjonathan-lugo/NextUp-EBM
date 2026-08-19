// Owner: Malika
//
// Takes hours and minutes as separate inputs instead of a single
// "minutes" field, so logging doesn't require mentally converting (e.g.
// "2 hours 30 minutes" used to mean typing 150). The API and storage are
// unchanged — still a single total-minutes number (see
// data/phoneTimeStore.js) — this just combines the two fields before
// sending.
//
// Hours/minutes are a grid of always-visible option buttons, not a
// <select> dropdown or number input — every value is on screen at
// once, and clicking one just highlights it blue (.pickerOptionSelected)
// instead of opening/closing anything. Also doubles as the fix for the
// Log Phone Time card leaving empty space below it next to the taller
// correlation card (see phone-correlation.module.css's .grid) — a full
// grid of buttons naturally takes up real vertical room instead of a
// couple of compact form fields.
import { useState } from 'react'
import Button from '../Button'
import { authFetch } from '../../data/authFetch'
import styles from '../../styles/phone-correlation.module.css'

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, hour) => hour)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5) // 0, 5, 10, ... 55

function TimePicker({ label, options, value, onSelect }) {
  return (
    <div className={styles.pickerGroup}>
      <span className={styles.pickerLabel}>{label}</span>
      <div className={styles.pickerGrid}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            className={
              value === option
                ? `${styles.pickerOption} ${styles.pickerOptionSelected}`
                : styles.pickerOption
            }
            aria-pressed={value === option}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PhoneTimeLogger() {
  const [hours, setHours] = useState(0)
  const [minutes, setMinutes] = useState(0)
  const [message, setMessage] = useState('')

  async function handleLog() {
    const totalMinutes = hours * 60 + minutes

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

      setHours(0)
      setMinutes(0)
      setMessage('Phone time logged successfully.')
    } catch (error) {
      console.error(error)
      setMessage('Could not save phone time.')
    }
  }

  return (
    <section className={styles.card}>
      <h2>Log Phone Time</h2>

      <TimePicker label="Hours" options={HOUR_OPTIONS} value={hours} onSelect={setHours} />
      <TimePicker label="Minutes" options={MINUTE_OPTIONS} value={minutes} onSelect={setMinutes} />

      <Button onClick={handleLog}>
        Log
      </Button>

      {message && <p className={styles.message}>{message}</p>}
    </section>
  )
}
