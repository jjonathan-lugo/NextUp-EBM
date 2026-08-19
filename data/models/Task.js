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
//   confirmed in hooks/useWeightCalculator.js (priority*1.5 + effort*0.5).
//   Due-date urgency is handled separately (data/rankTasks.js), not
//   folded into this number. Remaining open item: a planning-fallacy
//   stretch goal where effort estimates self-correct over time based on
//   actual timeSpentSeconds vs. the original effort score — not
//   implemented.
// @property {string} dueDate - ISO date string
// @property {string} [recommendedStart] - ISO date string, set by Smart Start feature (G)
// @property {'todo'|'in_progress'|'done'} status
// @property {number} timeSpentSeconds - logged via Focus Timer (J)
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
