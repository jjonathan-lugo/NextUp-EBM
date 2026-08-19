// Owner: Grace — recommendation endpoint
//
// v2: schedules across ALL pending tasks together instead of computing
// each task's recommended start in isolation (see data/scheduleTasks.js
// for the full algorithm and the "hardest anticipated parts" reasoning
// behind it).
//
// v3: also takes the caller's timezone. If the day-level schedule lands
// a task on the same day as its due date, and that day is "today" for
// this specific person, also returns a suggestedTime (a real clock time,
// not just a date) — see getSameDayStartTime in data/scheduleTasks.js.
//
// v4: batch mode. The UI moved from "click a task to see its
// recommendation" to a bullet list showing every task's recommendation
// at once, so a taskId is no longer required — when it's omitted, this
// returns an array covering every schedulable task in one response
// instead of making the caller loop and re-request the full schedule
// once per task (scheduleTasks() already computes the whole thing in a
// single pass, so per-task requests were redoing that work needlessly).
// The single-taskId shape is kept for callers that just want one task's
// recommendation.
import { getAllTasks } from '../../data/taskStore'
import { scheduleTasks, getSameDayStartTime } from '../../data/scheduleTasks'
import { isSameZonedDay } from '../../data/timezone'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { taskId, timezone } = req.body || {}

  try {
    const allTasks = await getAllTasks()
    const now = new Date()
    const schedulable = allTasks.filter((task) => task.status !== 'done' && task.dueDate)
    const schedule = scheduleTasks(schedulable, { timezone: timezone || 'UTC', now })

    // Shared per-task logic so single-task and batch mode compute the
    // recommendation the same way instead of two copies drifting apart.
    function buildRecommendation(task) {
      const recommendedStart = schedule.get(task.id) || null

      // The scheduler clamps an already-past due date to "today" so it
      // still returns a usable recommendedStart, but that's a fallback,
      // not a real recommendation — callers need to know explicitly that
      // this task is overdue so the UI can say so instead of showing a
      // stale date as if it were a normal future plan.
      const isOverdue = new Date(task.dueDate).getTime() < now.getTime()

      let suggestedTime = null

      if (isOverdue) {
        suggestedTime = now.toISOString()
      } else if (
        timezone &&
        isSameZonedDay(recommendedStart, task.dueDate, timezone) &&
        isSameZonedDay(recommendedStart, now.toISOString(), timezone)
      ) {
        suggestedTime = getSameDayStartTime({
          dueDate: task.dueDate,
          effort: task.effort,
          now,
        }).toISOString()
      }

      return { taskId: task.id, recommendedStart, suggestedTime, isOverdue }
    }

    if (taskId) {
      const target = allTasks.find((task) => task.id === taskId)
      if (!target) {
        return res.status(404).json({ error: 'Task not found' })
      }
      if (!target.dueDate) {
        return res.status(400).json({ error: 'Task has no due date' })
      }
      const { recommendedStart, suggestedTime, isOverdue } = buildRecommendation(target)
      return res.status(200).json({ recommendedStart, suggestedTime, isOverdue })
    }

    const recommendations = schedulable.map(buildRecommendation)
    return res.status(200).json({ recommendations })
  } catch (error) {
    console.error('Failed to schedule tasks:', error)
    return res.status(500).json({ error: 'Failed to compute recommended start time' })
  }
}