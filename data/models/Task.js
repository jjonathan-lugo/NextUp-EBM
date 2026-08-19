// Shared — define together before editing; used by all three features.
// Matches the shape agreed on in the Project Handoff doc.
//
// @typedef {Object} Task
// @property {string} id
// @property {string} title
// @property {string} [description]
// @property {number} effort - 1-5
// @property {number} priority - 1-5
// @property {number} weight - computed from effort + priority; formula
//   confirmed in data/weightFormula.js (priority*1.5 + effort*0.5),
//   shared by client (hooks/useWeightCalculator.js) and server
//   (pages/api/weighting.js).
//   Due-date urgency is handled separately (data/rankTasks.js), not
//   folded into this number. Still an open stretch goal: this number
//   itself doesn't self-correct based on actual timeSpentSeconds vs. the
//   original effort score — see hooks/useWeightCalculator.js's comment.
//   A narrower, related idea IS implemented though: Focus Timer's
//   Adaptive mode (data/adaptiveThreshold.js) personalizes its own
//   break-nudge timing from this same timeSpentSeconds history, without
//   feeding back into effort/weight.
// @property {string} dueDate - ISO date string
// @property {string} [recommendedStart] - ISO date string, set by Smart Start feature (G)
// @property {'todo'|'in_progress'|'done'} status
// @property {number} timeSpentSeconds - logged via Focus Timer (J); also
//   read back by data/adaptiveThreshold.js to personalize Adaptive mode
// @property {string} createdAt
// @property {string} updatedAt

export function createTask({
  id,
  title,
  description = '',
  effort = 1,
  priority = 1,
  weight = 0,
  dueDate = null,
  recommendedStart = null,
  status = 'todo',
  timeSpentSeconds = 0,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
}) {
  return {
    id,
    title,
    description,
    effort,
    priority,
    weight,
    dueDate,
    recommendedStart,
    status,
    timeSpentSeconds,
    createdAt,
    updatedAt,
  }
}
