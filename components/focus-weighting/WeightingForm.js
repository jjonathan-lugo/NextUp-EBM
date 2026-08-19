// Owner: Jonathan Lugo
import { useState } from 'react'
import { useWeightCalculator } from '../../hooks/useWeightCalculator'
import { useTimezone } from '../../hooks/useTimezone'
import { zonedTimeToUtc } from '../../data/timezone'
import { minLeadDays } from '../../data/scheduleTasks'
import { authFetch } from '../../data/authFetch'

function noticeHint(effort) {
  const days = minLeadDays(effort)
  if (days === 0) return 'No extra advance notice — Smart Start can wait until the last day for this.'
  return `Smart Start will recommend starting at least ${days} day${days === 1 ? '' : 's'} before the due date.`
}
import TaskWeightBar from './TaskWeightBar'
import Button from '../Button'
import styles from '../../styles/focus-weighting.module.css'

export default function WeightingForm() {
  const { timezone } = useTimezone()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  // datetime-local now, not date-only — a due date with no time can't
  // support a same-day time-of-day suggestion (see StartTimeRecommendation.js).
  const [dueDate, setDueDate] = useState('')
  // Doc spec: effort and priority are each scored 1-5.
  const [effort, setEffort] = useState(1)
  const [priority, setPriority] = useState(1)
  const { weight, calculate } = useWeightCalculator()
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSave() {
    if (!title.trim()) {
      setMessage('Give the task a title before saving.')
      return
    }

    // Always compute fresh off the current effort/priority rather than
    // trusting `weight` state, in case Save is clicked without hitting
    // Calculate Weight first.
    const computedWeight = calculate({ effort, priority })

    setSaving(true)
    setMessage('')

    try {
      const response = await authFetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          dueDate: dueDate ? zonedTimeToUtc(dueDate, timezone).toISOString() : null,
          effort,
          priority,
          weight: computedWeight,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save task')
      }

      setMessage('Task saved.')
      setTitle('')
      setDescription('')
      setDueDate('')
    } catch (error) {
      console.error(error)
      setMessage('Could not save task.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className={styles.card}>
      <h2>Task Weighting</h2>

      <label className={styles.field}>
        Title
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className={styles.field}>
        Description (optional)
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        Due date (optional)
        <input
          type="datetime-local"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>

      <label className={styles.field}>
        Effort (1-5)
        <span className={styles.hint}>
          How much work it&apos;ll take — not how important it is. 5 = a major
          undertaking, 1 = a quick task.
        </span>
        <span className={styles.hint}>{noticeHint(effort)}</span>
        <input
          type="number"
          min="1"
          max="5"
          value={effort}
          onChange={(e) => setEffort(Number(e.target.value))}
        />
      </label>
      <label className={styles.field}>
        Priority (1-5)
        <span className={styles.hint}>
          How important this is to you — not how soon it&apos;s due (due date is
          separate). 5 = must get done, 1 = nice to have.
        </span>
        <input
          type="number"
          min="1"
          max="5"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </label>

      <div className={styles.controls}>
        <Button onClick={() => calculate({ effort, priority })}>Calculate Weight</Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save Task'}
        </Button>
      </div>

      <TaskWeightBar weight={weight} max={10} />

      {message && <p className={styles.message}>{message}</p>}
    </section>
  )
}
