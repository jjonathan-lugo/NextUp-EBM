// Powers Adaptive mode's "real" personalization (components/focus-weighting/
// AdaptiveMode.js) — the planning-fallacy stretch goal flagged in
// data/models/Task.js and hooks/useWeightCalculator.js: instead of a fixed
// generic minutes-per-effort-level guess, use the user's OWN history of how
// long their effort-N tasks actually took (task.timeSpentSeconds, now
// persisted by FocusTimer.js) to calibrate the nudge threshold. If your
// effort-3 tasks always run 40 minutes instead of the generic 25, the nudge
// should reflect that instead of always guessing low.
//
// Deliberately narrow in scope: this personalizes ONLY the Adaptive-mode
// nudge threshold, not the day-budget scheduler's own effort->minutes
// estimate (data/scheduleTasks.js's EFFORT_TO_MINUTES) or the weight
// formula (data/weightFormula.js) — those drive Smart Start's actual
// scheduling math, and changing that behavior wasn't asked for here.

// Same defaults AdaptiveMode.js used before personalization existed —
// still the fallback for effort levels with too little history to trust.
const DEFAULT_THRESHOLD_MINUTES = {
  1: 10,
  2: 15,
  3: 25,
  4: 35,
  5: 45,
}

// Don't personalize off a single data point — one unusually long or short
// session shouldn't immediately override the generic estimate.
const MIN_HISTORY_SAMPLES = 2

// Floor so a couple of very short logged sessions (e.g. a task marked done
// almost immediately) can't collapse the threshold to something unusably
// small.
const MIN_THRESHOLD_MINUTES = 5

export function defaultThresholdMinutes(effort) {
  const clamped = Math.max(1, Math.min(5, effort))
  return DEFAULT_THRESHOLD_MINUTES[clamped]
}

// historicalTasks: the user's full task list (done and not-done both fine
// to pass in — only done tasks with logged time are actually used).
// Returns { minutes, personalized, sampleCount } — `personalized` and
// `sampleCount` let the UI be honest about whether it's showing a real
// personal average or still just the generic default.
export function personalizedThreshold(effort, historicalTasks) {
  const clamped = Math.max(1, Math.min(5, effort))

  const samplesMinutes = (historicalTasks || [])
    .filter(
      (task) => task.status === 'done' && task.effort === clamped && task.timeSpentSeconds > 0
    )
    .map((task) => task.timeSpentSeconds / 60)

  if (samplesMinutes.length < MIN_HISTORY_SAMPLES) {
    return {
      minutes: defaultThresholdMinutes(clamped),
      personalized: false,
      sampleCount: samplesMinutes.length,
    }
  }

  const average = samplesMinutes.reduce((sum, minutes) => sum + minutes, 0) / samplesMinutes.length

  return {
    minutes: Math.max(MIN_THRESHOLD_MINUTES, Math.round(average)),
    personalized: true,
    sampleCount: samplesMinutes.length,
  }
}
