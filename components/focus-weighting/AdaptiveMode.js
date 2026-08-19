// Owner: Jonathan Lugo
import styles from '../../styles/focus-weighting.module.css'

// v1 nudge logic: fixed time-threshold-per-effort-level heuristic (not real
// ML/personalization) — real adaptivity is a stretch goal for later.
const THRESHOLD_MINUTES_BY_EFFORT = {
  1: 10,
  2: 15,
  3: 25,
  4: 35,
  5: 45,
}

function getDiminishingReturnsThreshold(effort) {
  const clamped = Math.max(1, Math.min(5, effort))
  return THRESHOLD_MINUTES_BY_EFFORT[clamped] * 60 // seconds, to match useTimer's unit
}

function hasHitDiminishingReturns(seconds, threshold) {
  return seconds >= threshold
}

// effort/seconds/taskTitle are wired up from FocusTimer.js's task picker —
// effort comes from whichever task is selected there (defaults to 1, the
// shortest threshold, if none is selected), so a heavier task earns more
// uninterrupted time before this nudges a break.
export default function AdaptiveMode({ effort = 1, seconds = 0, taskTitle = '' }) {
  const threshold = getDiminishingReturnsThreshold(effort)
  const shouldNudge = hasHitDiminishingReturns(seconds, threshold)
  const thresholdMinutes = Math.round(threshold / 60)

  return (
    <div>
      <p>
        Adaptive mode: nudges after about {thresholdMinutes} min
        {taskTitle ? ` on "${taskTitle}"` : ' (no task selected)'} — effort {effort}
      </p>
      {shouldNudge && (
        <p role="status" className={styles.nudge}>
          {taskTitle
            ? `You've been on "${taskTitle}" a while — might be worth a break or switching tasks.`
            : "You've been at this a while — might be worth a break or switching tasks."}
        </p>
      )}
    </div>
  )
}
