// Shared — coordinate before editing; used by multiple features.
// Per the handoff doc: takes display-toggle props so each feature can
// customize what it shows without needing its own card component.
//
// showWeight     — smart-start-feed / focus-weighting: show computed weight
// showTimer      — focus-weighting: show total logged time (task.timeSpentSeconds,
//                  persisted via FocusTimer.js — cumulative across sessions, not
//                  just the current one)
// showPhoneStat  — phone-correlation: show phone-time stat for this task
import styles from './TaskCard.module.css'

function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

// Weight (see data/weightFormula.js) ranges 2-10. Colors it by intensity
// on the accent hue rather than a red/green scale — a high weight isn't
// "bad", so it shouldn't borrow the danger/success colors that Smart
// Start's urgency badges use for status. Thresholds split the 2-10
// range roughly into thirds.
function weightTier(weight) {
  if (typeof weight !== 'number') return 'weightLow'
  if (weight >= 7.5) return 'weightHigh'
  if (weight >= 5) return 'weightMid'
  return 'weightLow'
}

export default function TaskCard({
  task,
  onSelect,
  showWeight = false,
  showTimer = false,
  showPhoneStat = false,
}) {
  if (!task) return null

  const cardClassName = onSelect ? `${styles.card} ${styles.clickable}` : styles.card

  return (
    <div className={cardClassName} onClick={() => onSelect && onSelect(task)}>
      <h3 className={styles.title}>{task.title}</h3>
      {task.description && <p className={styles.description}>{task.description}</p>}

      {showWeight && (
        <p className={styles.meta}>
          Weight:{' '}
          <span className={`${styles.weightBadge} ${styles[weightTier(task.weight)]}`}>
            {task.weight ?? '—'}
          </span>
        </p>
      )}
      {showTimer && (
        <p className={styles.meta}>Time spent: {formatDuration(task.timeSpentSeconds ?? 0)}</p>
      )}
      {showPhoneStat && (
        // Not implemented: no per-task phone-time data exists yet.
        // /api/phone-time logs are per-day totals (see
        // hooks/useCorrelationData.js), not tied to a task id — attributing
        // phone time to a specific task is a data-model decision for
        // Malika to make, not something to fake here.
        <p className={styles.meta}>Phone time: —</p>
      )}
    </div>
  )
}
