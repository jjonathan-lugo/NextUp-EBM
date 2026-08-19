// Owner: Jonathan Lugo
import { personalizedThreshold } from '../../data/adaptiveThreshold'
import styles from '../../styles/focus-weighting.module.css'

function hasHitDiminishingReturns(seconds, thresholdMinutes) {
  return seconds >= thresholdMinutes * 60
}

// effort/seconds/taskTitle are wired up from FocusTimer.js's task picker —
// effort comes from whichever task is selected there (defaults to 1, the
// shortest threshold, if none is selected).
//
// historicalTasks (the user's full task list, done and not) drives the
// "real" personalization this used to lack: data/adaptiveThreshold.js
// looks at how long this specific person's past tasks at this effort
// level actually took (task.timeSpentSeconds, persisted by
// FocusTimer.js's Pause/Reset/task-switch handlers) and uses that average
// instead of the generic per-effort-level guess, once there's enough
// history to trust (2+ completed tasks at that level). Falls back to the
// same fixed defaults as before until then — a brand new user, or one
// who hasn't finished an effort-5 task yet, still gets a sane threshold.
export default function AdaptiveMode({ effort = 1, seconds = 0, taskTitle = '', historicalTasks = [] }) {
  const { minutes: thresholdMinutes, personalized, sampleCount } = personalizedThreshold(
    effort,
    historicalTasks
  )
  const shouldNudge = hasHitDiminishingReturns(seconds, thresholdMinutes)

  return (
    <div>
      <p>
        Adaptive mode: nudges after about {thresholdMinutes} min
        {taskTitle ? ` on "${taskTitle}"` : ' (no task selected)'} — effort {effort}
      </p>
      <p className={styles.hint}>
        {personalized
          ? `Based on the average of your ${sampleCount} completed effort-${effort} task${sampleCount === 1 ? '' : 's'}.`
          : 'Using the default estimate — finish a couple of tasks at this effort level to personalize it.'}
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
