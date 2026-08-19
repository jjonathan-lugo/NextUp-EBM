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
// This component only renders the two decision cards now — it used to
// also own the full "All Tasks" list and all the fetching/mutation state
// behind everything, but that's been lifted into
// hooks/useTaskManagement.js so AllTasksList.js (rendered separately,
// under Productivity Tips on the Smart Start page) can share the exact
// same task state instead of fetching its own independent copy. Both
// components now receive that state/those handlers as props from
// pages/smart-start.js, which is the single place useTaskManagement() is
// called. EditTaskForm, UrgencyBadge, and describeRecommendation are
// exported (not just used locally) because AllTasksList.js needs the
// identical edit form and badge for its own rows — same behavior, one
// definition.
//
// Persistence: tasks live in Supabase (data/taskStore.js), not browser
// storage, so anything done here — marking done, deleting, editing —
// survives closing the tab/browser and coming back, same as task
// creation already does.
import { useEffect, useState } from 'react'
import TaskCard from '../shared/TaskCard'
import Button from '../Button'
import { zonedTimeToUtc, utcToZonedDateTimeLocal, formatZonedDate, formatZonedDateTime, formatZonedTime, isSameZonedDay } from '../../data/timezone'
import { rankTasks, rankByWeight, urgencyTier, URGENCY } from '../../data/rankTasks'
import { minLeadDays } from '../../data/scheduleTasks'
import { authFetch } from '../../data/authFetch'
import styles from '../../styles/smart-start-feed.module.css'

// Mirrors the hint shown in WeightingForm.js — lets someone see, right
// where they're setting effort, how much of a heads-up that level
// actually gets from the scheduler (data/scheduleTasks.js's
// MIN_LEAD_DAYS), instead of only discovering it later in a recommendation.
function noticeHint(effort) {
  const days = minLeadDays(effort)
  if (days === 0) return 'No extra advance notice — Smart Start can wait until the last day for this.'
  return `Smart Start will recommend starting at least ${days} day${days === 1 ? '' : 's'} before the due date.`
}

export function EditTaskForm({ task, timezone, onCancel, onSaved }) {
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
      const response = await authFetch(`/api/tasks/${task.id}`, {
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
      <div className={styles.actions}>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
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
    return `Due ${formatZonedDateTime(task.dueDate, timezone)} — start today to stay on track.`
  }
  return `Highest priority right now — due ${formatZonedDateTime(task.dueDate, timezone)}.`
}

// The no-deadline decision has no urgency story to tell — it's weight
// alone (see rankByWeight in data/rankTasks.js).
function describeAnytimeDecision(task) {
  return `No due date — highest priority by weight (${task.weight ?? '—'}) among tasks without a deadline.`
}

// Builds the human-readable recommendation line for one task in
// AllTasksList's rows.
export function describeRecommendation(task, recommendation, timezone, recommendationsLoading) {
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
    // Date only (not formatZonedDateTime) — recommendedStart is always a
    // day's midnight (see data/scheduleTasks.js), so a time here would
    // just always read "12:00 AM".
    return `Start by ${formatZonedDate(recommendedStart, timezone)} to finish on time.`
  }
  return 'No recommendation available.'
}

// Small colored status pill, reusing the same urgency tiers the ranking
// itself is built on (data/rankTasks.js) so the badge can never disagree
// with why a task was actually picked. Tasks with no due date don't get
// one here — they're already labeled by the "No Deadline" section they
// live in.
export function UrgencyBadge({ task, recommendation, timezone }) {
  if (!task.dueDate) return null

  const tier = urgencyTier(task, recommendation, new Date().toISOString(), timezone)
  const badge = {
    [URGENCY.OVERDUE]: { label: 'Overdue', className: styles.badgeDanger },
    [URGENCY.DUE_TODAY]: { label: 'Due today', className: styles.badgeWarning },
    [URGENCY.NEEDS_TODAY]: { label: 'Start today', className: styles.badgeWarningSoft },
    [URGENCY.LATER]: { label: 'On track', className: styles.badgeNeutral },
  }[tier]

  return <span className={`${styles.badge} ${badge.className}`}>{badge.label}</span>
}

export default function TaskPicker({
  tasks,
  loading,
  editingId,
  setEditingId,
  recommendations,
  recommendationsLoading,
  actionError,
  timezone,
  handleSaved,
  handleMarkDone,
  handleDelete,
}) {
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
            timezone={timezone}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <div key={decidedTask.id} className={styles.decisionCard}>
          <UrgencyBadge task={decidedTask} recommendation={recommendations[decidedTask.id]} timezone={timezone} />
          <TaskCard task={decidedTask} showWeight />
          <p className={styles.reason}>
            {describeDecision(decidedTask, recommendations[decidedTask.id], timezone)}
          </p>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setEditingId(decidedTask.id)}>Edit</Button>
            <Button variant="success" onClick={() => handleMarkDone(decidedTask.id)}>Mark done</Button>
            <Button variant="danger" onClick={() => handleDelete(decidedTask.id)}>Delete</Button>
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
            timezone={timezone}
            onCancel={() => setEditingId(null)}
            onSaved={handleSaved}
          />
        </div>
      ) : (
        <div key={decidedAnytimeTask.id} className={styles.decisionCard}>
          <span className={`${styles.badge} ${styles.badgeNeutral}`}>No deadline</span>
          <TaskCard task={decidedAnytimeTask} showWeight />
          <p className={styles.reason}>{describeAnytimeDecision(decidedAnytimeTask)}</p>
          <div className={styles.actions}>
            <Button variant="ghost" onClick={() => setEditingId(decidedAnytimeTask.id)}>Edit</Button>
            <Button variant="success" onClick={() => handleMarkDone(decidedAnytimeTask.id)}>Mark done</Button>
            <Button variant="danger" onClick={() => handleDelete(decidedAnytimeTask.id)}>Delete</Button>
          </div>
        </div>
      )}
    </div>
  )
}
