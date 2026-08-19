// The confirmed weight formula (settled 2026-08-19) — was duplicated
// between hooks/useWeightCalculator.js (client) and pages/api/weighting.js
// (server), each with a comment flagging the drift risk. Pulled out here
// so there's exactly one place this can go wrong, per those comments'
// own suggestion.
//
// Weights priority higher than effort (3:1) and is scaled to land in the
// 2-10 range so TaskWeightBar's max={10} in WeightingForm.js still holds.
// Due-date urgency is handled separately by data/rankTasks.js, not
// folded into this number.
export const PRIORITY_WEIGHT = 1.5
export const EFFORT_WEIGHT = 0.5

export function computeWeight(priority, effort) {
  return Math.round((priority * PRIORITY_WEIGHT + effort * EFFORT_WEIGHT) * 10) / 10
}
