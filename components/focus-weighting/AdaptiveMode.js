// Owner: Jonathan Lugo
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

// TODO(J): effort/seconds aren't passed down from FocusTimer yet — wire
// those up once useTimer actually counts and a task is selected.
export default function AdaptiveMode({ effort = 4, seconds = 22489 }) {
  const threshold = getDiminishingReturnsThreshold(effort)
  const shouldNudge = hasHitDiminishingReturns(seconds, threshold)

  return (
    <div>
      <p>Adaptive mode: interval based on task weight</p>
      {shouldNudge && (
        <p role="status">
          You&apos;ve been at this a while — might be worth a break or switching tasks.
        </p>
      )}
    </div>
  )
}
