// Shared — coordinate before editing; backs the Task list used by all features.
//
// Backed by data/taskStore.js, which now talks to the real Supabase
// (Postgres) database. Those calls are async, so this handler awaits them.
import { getAllTasks, addTask } from '../../../data/taskStore'

function isValidTaskInput(body) {
  return Boolean(body && typeof body.title === 'string' && body.title.trim().length > 0)
}

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      try {
        const tasks = await getAllTasks()
        return res.status(200).json(tasks)
      } catch (error) {
        console.error('Failed to fetch tasks:', error)
        return res.status(500).json({ error: 'Failed to fetch tasks' })
      }
    }
    case 'POST': {
      if (!isValidTaskInput(req.body)) {
        return res.status(400).json({ error: 'title is required' })
      }
      try {
        const task = await addTask(req.body)
        return res.status(201).json(task)
      } catch (error) {
        console.error('Failed to create task:', error)
        return res.status(500).json({ error: 'Failed to create task' })
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
