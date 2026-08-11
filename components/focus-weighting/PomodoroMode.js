// Owner: Jonathan Lugo
const WORK_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60
const CYCLE_SECONDS = WORK_SECONDS + BREAK_SECONDS

function getPhase(seconds) {
  const elapsedInCycle = seconds % CYCLE_SECONDS
  return elapsedInCycle < WORK_SECONDS ? 'work' : 'break'
}

function getRemainingInPhase(seconds) {
  const elapsedInCycle = seconds % CYCLE_SECONDS
  return getPhase(seconds) === 'work'
    ? WORK_SECONDS - elapsedInCycle
    : CYCLE_SECONDS - elapsedInCycle
}

// TODO(J): seconds comes from FocusTimer's shared useTimer, which doesn't
// actually count yet — this will show 25:00 work until that's wired up.
export default function PomodoroMode({ seconds = 0 }) {
  const phase = getPhase(seconds)
  const remaining = getRemainingInPhase(seconds)
  const minutes = Math.floor(remaining / 60)
  const secs = remaining % 60

  return (
    <div>
      <p>Pomodoro mode: 25 min work / 5 min break</p>
      <p>
        {phase === 'work' ? 'Work' : 'Break'} — {minutes}:{String(secs).padStart(2, '0')} left
      </p>
    </div>
  )
}
