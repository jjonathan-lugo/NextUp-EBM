// Shared ranking logic for "decide the next task" — used by both
// Smart Start (components/smart-start-feed/TaskPicker.js, a single
// decided task) and the homepage Focus Queue
// (hooks/useFocusQueue.js, top 3). Pulled out into one place so the two
// features can't drift into using different rules for what counts as
// "next" — team decision (see TaskPicker.js's original comment) was that
// the two should agree: urgency (overdue / due today / needs today's
// budget) beats weight (priority + effort) across tiers; weight only
// decides order within the same tier.
import { isSameZonedDay } from './timezone'

export const URGENCY = {
  OVERDUE: 0,
  DUE_TODAY: 1,
  // Due later, but the day-budget scheduler (data/scheduleTasks.js) says
  // the work has to start today to still finish on time — a task due in
  // 3 days but effortful enough that today's slice of the daily budget
  // is already spoken for.
  NEEDS_TODAY: 2,
  // Also covers tasks with no due date at all — no urgency signal to go
  // on, so they fall back to weight-only comparison like everything else
  // in this tier.
  LATER: 3,
}

export function urgencyTier(task, recommendation, nowIso, timezone) {
  if (!task.dueDate) return URGENCY.LATER
  if (recommendation?.isOverdue) return URGENCY.OVERDUE
  if (isSameZonedDay(task.dueDate, nowIso, timezone)) return URGENCY.DUE_TODAY
  if (
    recommendation?.recommendedStart &&
    isSameZonedDay(recommendation.recommendedStart, nowIso, timezone)
  ) {
    return URGENCY.NEEDS_TODAY
  }
  return URGENCY.LATER
}

// Ranks non-done tasks by urgency tier first, then weight (priority +
// effort) descending, then earliest due date as a final tiebreak.
// `recommendations` is a map of taskId -> { isOverdue, recommendedStart,
// suggestedTime } as returned by /api/start-time's batch mode.
export function rankTasks(tasks, recommendations, timezone) {
  const nowIso = new Date().toISOString()

  return tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => {
      const tierA = urgencyTier(a, recommendations[a.id], nowIso, timezone)
      const tierB = urgencyTier(b, recommendations[b.id], nowIso, timezone)
      if (tierA !== tierB) return tierA - tierB

      const weightA = a.weight ?? 0
      const weightB = b.weight ?? 0
      if (weightA !== weightB) return weightB - weightA

      if (!a.dueDate || !b.dueDate) return 0
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
}

// For tasks with no due date at all — there's no urgency signal to rank
// by, so this decides purely on weight (priority + effort), with the
// oldest task as a tiebreak so equally-weighted backlog items don't sit
// forever just because they keep losing ties to newer ones.
export function rankByWeight(tasks) {
  return tasks
    .filter((task) => task.status !== 'done')
    .sort((a, b) => {
      const weightA = a.weight ?? 0
      const weightB = b.weight ?? 0
      if (weightA !== weightB) return weightB - weightA
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
}
