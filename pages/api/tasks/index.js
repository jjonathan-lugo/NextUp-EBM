// Shared — coordinate before editing; backs the Task list used by all features.
//
// Backed by data/taskStore.js (Supabase/Postgres). Every request now
// requires a valid Supabase session (see data/supabaseServerClient.js) —
// requireUser() verifies the caller's bearer token and returns a client
// scoped to them, so Row Level Security restricts every query to that
// user's own rows.
import { getAllTasks, addTask } from '../../../data/taskStore'
import { requireUser } from '../../../data/supabaseServerClient'

function isValidTaskInput(body) {
  return Boolean(body && typeof body.title === 'string' && body.title.trim().length > 0)
}

export default async function handler(req, res) {
  const auth = await requireUser(req)
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { supabase } = auth

  switch (req.method) {
    case 'GET': {
      try {
        const tasks = await getAllTasks(supabase)
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
        const task = await addTask(supabase, req.body)
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
