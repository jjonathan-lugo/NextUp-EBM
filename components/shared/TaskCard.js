// Shared — coordinate before editing; used by multiple features.
// Per the handoff doc: takes display-toggle props so each feature can
// customize what it shows without needing its own card component.
//
// showWeight     — smart-start-feed / focus-weighting: show computed weight
// showTimer      — focus-weighting: show time spent this session
// showPhoneStat  — phone-correlation: show phone-time stat for this task

export default function TaskCard({
  task,
  onSelect,
  showWeight = false,
  showTimer = false,
  showPhoneStat = false,
}) {
  if (!task) return null

  return (
    <div onClick={() => onSelect && onSelect(task)}>
      <h3>{task.title}</h3>
      {task.description && <p>{task.description}</p>}

      {showWeight && (
        // TODO: render task.weight (see data/models/Task.js for how it's computed)
        <p>Weight: {task.weight}</p>
      )}
      {showTimer && (
        // TODO(J): format task.timeSpentSeconds
        <p>Time spent: {task.timeSpentSeconds}s</p>
      )}
      {showPhoneStat && (
        // TODO(M): wire up the actual phone-time stat for this task
        <p>Phone time: —</p>
      )}
    </div>
  )
}
