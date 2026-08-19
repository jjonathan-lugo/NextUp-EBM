// Owner: Grace
//
// This is the actual "Smart Start" decision, not a to-do list. The point
// of the feature (per the project's decision-fatigue-reduction goal) is
// to eliminate choice: instead of showing every task and making the user
// pick one, this decides the single task to start right now and shows
// only that, using both signals the app tracks per task —
//   - weight (priority + effort, see data/models/Task.js /
//     hooks/useWeightCalculator.js)
//   - due-date urgency (overdue / due today / needs to start today to
//     hit a later due date, from /api/start-time's batch schedule — see
//     data/scheduleTasks.js)
// Ranking logic itself now lives in data/rankTasks.js, shared with the
// homepage Focus Queue (hooks/useFocusQueue.js) so the two features can't
// disagree about what "next" means.
//
// Two separate decisions are shown, because "no due date" isn't really a
// point on the same urgency scale as "due in 3 days" — it means there's
// no deadline signal at all. Rather than quietly folding those tasks into
// the due-date decision's lowest tier, they get their own section decided
// purely by weight (priority + effort), via rankByWeight in
// data/rankTasks.js.
//
// Also handles marking a task done and deleting it — both immediately
// re-rank whichever decision that task belonged to (a completed/deleted
// task can't remain the decided task, and the next-best one takes its
// place automatically) — and editing a task's fields (e.g. adding a
// missing due date, which moves it from the "no deadline" decision into
// the due-date one on the next render). This is the only place in the
// app that lists every task, so it's also where all of that management
// happens; the full list is tucked behind a "Show all tasks" toggle
// instead of being the primary view.
//
// Persistence: tasks live in Supabase (data/taskStore.js), not browser
// storage, so anything done here — marking done, deleting, editing —
// survives closing the tab/browser and coming back, same as task
// creation already does.
import { useEffect, useState } from 'react'
import TaskCard from '../shared/TaskCard'
import Button from '../Button'
import { useTimezone } from '../../hooks/useTimezone'
import { zonedTimeToUtc, utcToZonedDateTimeLocal, formatZonedDate, formatZonedTime, isSameZonedDay } from '../../data/timezone'
import { rankTasks, rankByWeight } from '../../data/rankTasks'
import { fetchRecommendations } from '../../data/fetchRecommendations'
import styles from '../../styles/smart-start-feed.module.css'

function EditTaskForm({ task, onCancel, onSaved }) {
  const { timezone } = useTimezone()
  const [title, setTitle] = useState(task.title)
  const [dueDate, setDueDate] = useState('')
  const [effort, setEffort] = useState(task.effort)
  const [priority, setPriority] = useState(task.priority)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // useTimezone() starts at 'UTC' and corrects to the real timezone a
  // moment after mount (see hooks/useTimezone.js). A useState initializer
  // only runs once, so computing dueDate that way froze it on whatever
  // (likely wrong) timezone was available at that exact render — this
  // effect re-syncs it once the real timezone lands instead.
  useEffect(() => {
    setDueDate(task.dueDate ? utcToZonedDateTimeLocal(task.dueDate, timezone) : '')
  }, [task.dueDate, timezone])

  async function handleSave() {
    setSaving(true)
    setError('')

    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          dueDate: dueDate ? zonedTimeToUtc(dueDate, timezone).toISOString() : null,
          effort,
          priority,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update task')
      }

      const updated = await response.json()
      onSaved(updated)
    } catch (err) {
      console.error(err)
      setError('Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.editForm}>
      <label className={styles.field}>
        Title
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className={styles.field}>
        Due date
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
      <div className={styles.actions}>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  )
}

// Explains *why* the decided task was picked — leads with urgency since
// that's what overrides weight, per the ranking rule in data/rankTasks.js.
function describeDecision(task, recommendation, timezone) {
  if (!recommendation) {
    return 'Calculating...'
  }

  const { recommendedStart, suggestedTime, isOverdue } = recommendation

  if (isOverdue) {
    return 'Overdue — start it now.'
  }
  if (suggestedTime) {
    return `Due today — start by ${formatZonedTime(suggestedTime, timezone)} to finish on time.`
  }
  if (recommendedStart && isSameZonedDay(recommendedStart, new Date().toISOString(), timezone)) {
    return `Due ${formatZonedDate(task.dueDate, timezone)} — start today to stay on track.`
  }
  return `Highest priority right now — due ${formatZonedDate(task.dueDate, timezone)}.`
}

// The no-deadline decision has no urgency story to tell — it's weight
// alone (see rankByWeight in data/rankTasks.js).
function describeAnytimeDecision(task) {
  return `No due date — highest priority by weight (${task.weight ?? '—'}) among tasks without a deadline.`
}

// Builds the human-readable recommendation line for one task in the full
// (secondary) list.
function describeRecommendation(task, recommendation, timezone, recommendationsLoading) {
  if (task.status === 'done') {
    return 'Done.'
  }
  if (!task.dueDate) {
    return 'No due date.'
  }
  if (recommendationsLoading || !recommendation) {
    return 'Calculating recommended start time...'
  }

  const { recommendedStart, suggestedTime, isOverdue } = recommendation

  if (isOverdue) {
    return 'Overdue — start it now.'
  }
  if (suggestedTime) {
    return `Start today by ${formatZonedTime(suggestedTime, timezone)} to finish on time.`
  }
  if (recommendedStart) {
    return `Start by ${formatZonedDate(recommendedStart, timezone)} to finish on time.`
  }
  return 'No recommendation available.'
}

export default function TaskPicker() {
  const { timezone } = useTimezone()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [recommendations, setRecommendations] = useState({})
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  // Re-fetches the whole batch whenever the task list changes (initial
  // load, after an edit, or after marking done/deleting) or the detected
  // timezone changes.
  useEffect(() => {
    const schedulable = tasks.filter((task) => task.status !== 'done' && task.dueDate)
    if (schedulable.length === 0) {
      setRecommendations({})
      return undefined
    }

    let cancelled = false

    async function loadRecommendations() {
      setRecommendationsLoading(true)
      try {
        const byTaskId = await fetchRecommendations(timezone)
        if (!cancelled) setRecommendations(byTaskId)
      } catch (error) {
        console.error('Failed to load start-time recommendations:', error)
        if (!cancelled) setRecommendations({})
      } finally {
        if (!cancelled) setRecommendationsLoading(false)
      }
    }

    loadRecommendations()

    return () => {
      cancelled = true
    }
  }, [tasks, timezone])

  async function loadTasks() {
    setLoading(true)
    try {
      const response = await fetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Could not load tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(updatedTask) {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingId(null)
  }

  async function handleMarkDone(taskId) {
    setActionError('')
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
      if (!response.ok) {
        throw new Error('Failed to mark task done')
      }
      const updated = await response.json()
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)))
    } catch (error) {
      console.error(error)
      setActionError('Could not mark that task done.')
    }
  }

  async function handleDelete(taskId) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this task? This can’t be undone.')) {
      return
    }

    setActionError('')
    try {
      const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete task')
      }
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      if (editingId === taskId) setEditingId(null)
    } catch (error) {
      console.error(error)
      setActionError('Could not delete that task.')
    }
  }

  if (loading) {
    return <p>Loading tasks...</p>
  }

  if (tasks.length === 0) {
    return <p>No tasks yet — add one from the Focus page to get a start-time recommendation.</p>
  }

  // Split up front — the due-date decision and the no-deadline decision
  // draw from disjoint sets, so a task only ever shows up in one of them.
  const dueDateTasks = tasks.filter((task) => task.dueDate)
  const noDueDateTasks = tasks.filter((task) => !task.dueDate)

  const rankedTasks = rankTasks(dueDateTasks, recommendations, timezone)
  const decidedTask = rankedTasks[0]

  const rankedAnytimeTasks = rankByWeight(noDueDateTasks)
  const decidedAnytimeTask = rankedAnytimeTasks[0]

  return (
    <div>
      <h2 className={styles.sectionTitle}>Start This</h2>

      {actionError && <p className={styles.errorText} role="alert">{actionError}</p>}

      {recommendationsLoading && !decidedTask ? (
        <p className={styles.emptyState}>Deciding what to start...</p>
      ) : !decidedTask ? (
        <p className={styles.emptyState}>No pending tasks with a due date.</p>
      ) : editingId === decidedTask.id ? (
        <div className={styles.decisionCard}>
          <EditTaskForm
            task={decidedTask}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <div className={styles.decisionCard}>
          <TaskCard task={decidedTask} showWeight />
          <p className={styles.reason}>
            {describeDecision(decidedTask, recommendations[decidedTask.id], timezone)}
          </p>
          <div className={styles.actions}>
            <Button onClick={() => setEditingId(decidedTask.id)}>Edit</Button>
            <Button onClick={() => handleMarkDone(decidedTask.id)}>Mark done</Button>
            <Button onClick={() => handleDelete(decidedTask.id)}>Delete</Button>
          </div>
        </div>
      )}

      <h2 className={styles.sectionTitle}>No Deadline — Do This Next</h2>

      {!decidedAnytimeTask ? (
        <p className={styles.emptyState}>No pending tasks without a due date.</p>
      ) : editingId === decidedAnytimeTask.id ? (
        <div className={styles.decisionCard}>
          <EditTaskForm
            task={decidedAnytimeTask}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <div className={styles.decisionCard}>
          <TaskCard task={decidedAnytimeTask} showWeight />
          <p className={styles.reason}>{describeAnytimeDecision(decidedAnytimeTask)}</p>
          <div className={styles.actions}>
            <Button onClick={() => setEditingId(decidedAnytimeTask.id)}>Edit</Button>
            <Button onClick={() => handleMarkDone(decidedAnytimeTask.id)}>Mark done</Button>
            <Button onClick={() => handleDelete(decidedAnytimeTask.id)}>Delete</Button>
          </div>
        </div>
      )}

      <div className={styles.toggleRow}>
        <Button onClick={() => setShowAll((value) => !value)}>
          {showAll ? 'Hide' : 'Show'} all tasks
        </Button>
      </div>

      {showAll && (
        <ul className={styles.taskList}>
          {tasks.map((task) =>
            editingId === task.id ? (
              <li key={task.id} className={styles.taskRow}>
                <EditTaskForm
                  task={task}
                  onCancel={() => setEditingId(null)}
                  onSaved={handleSaved}
                />
              </li>
            ) : (
              <li key={task.id} className={styles.taskRow}>
                <span
                  className={
                    task.status === 'done'
                      ? `${styles.taskTitle} ${styles.taskDone}`
                      : styles.taskTitle
                  }
                >
                  {task.title}
                </span>
                <span className={styles.taskMeta}>
                  {'Weight: '}
                  {task.weight ?? '—'}
                  {' — '}
                  {describeRecommendation(task, recommendations[task.id], timezone, recommendationsLoading)}
                </span>
                <div className={styles.taskActions}>
                  <Button onClick={() => setEditingId(task.id)}>Edit</Button>
                  {task.status !== 'done' && (
                    <Button onClick={() => handleMarkDone(task.id)}>Mark done</Button>
                  )}
                  <Button onClick={() => handleDelete(task.id)}>Delete</Button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  )
}
