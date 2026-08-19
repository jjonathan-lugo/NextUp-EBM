// Shared — coordinate before editing; backs the Task list used by all features.
//
// Backed by data/taskStore.js, which now talks to the real Supabase
// (Postgres) database. Those calls are async, so this handler awaits them.
import { getTaskById, updateTask, deleteTask } from '../../../data/taskStore'

export default async function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET': {
      try {
        const task = await getTaskById(id)
        if (!task) return res.status(404).json({ error: 'Task not found' })
        return res.status(200).json(task)
      } catch (error) {
        console.error('Failed to fetch task:', error)
        return res.status(500).json({ error: 'Failed to fetch task' })
      }
    }
    case 'PUT': {
      try {
        const task = await updateTask(id, req.body || {})
        if (!task) return res.status(404).json({ error: 'Task not found' })
        return res.status(200).json(task)
      } catch (error) {
        console.error('Failed to update task:', error)
        return res.status(500).json({ error: 'Failed to update task' })
      }
    }
    case 'DELETE': {
      try {
        const deleted = await deleteTask(id)
        if (!deleted) return res.status(404).json({ error: 'Task not found' })
        return res.status(204).end()
      } catch (error) {
        console.error('Failed to delete task:', error)
        return res.status(500).json({ error: 'Failed to delete task' })
      }
    }
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
