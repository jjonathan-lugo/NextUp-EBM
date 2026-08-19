// Owner: Grace
//
// Extracted out of TaskPicker.js so the fetched task list + edit/mark
// done/delete handlers can be shared by two separate components on the
// Smart Start page: TaskPicker (the "Start This" / "No Deadline"
// decision cards) and AllTasksList (the full "All Tasks" list, now
// rendered under Productivity Tips instead of always trailing the
// decision cards). Calling this hook once at the page level
// (pages/smart-start.js) and passing its return value down as props to
// both components is what keeps them in sync — e.g. marking a task
// done in the full list immediately updates the decision cards too,
// since both are reading the same `tasks` state rather than each
// fetching their own independent copy.
import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { useTimezone } from './useTimezone'
import { fetchRecommendations } from '../data/fetchRecommendations'
import { authFetch } from '../data/authFetch'

export function useTaskManagement() {
  const { user, loading: authLoading } = useAuth()
  const { timezone } = useTimezone()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [recommendations, setRecommendations] = useState({})
  const [recommendationsLoading, setRecommendationsLoading] = useState(false)
  const [actionError, setActionError] = useState('')

  // This hook is called unconditionally at the page level (both
  // TaskPicker and AllTasksList need the same shared state — see the
  // top-of-file comment), so it has to know about auth itself instead
  // of relying on a RequireAuth wrapper to stop it from running. Waits
  // out useAuth's own initial session check (authLoading) before
  // deciding there's no user — deciding too early would flash "no
  // tasks" for a signed-in user for a moment on every load. Once
  // resolved, skips the fetch entirely while signed out (same guard
  // FocusTimer.js uses) rather than firing a request that authFetch
  // would send unauthenticated and the API would just 401.
  useEffect(() => {
    if (authLoading) return
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }
    loadTasks()
  }, [user, authLoading])

  // Re-fetches the whole batch whenever the task list changes (initial
  // load, after an edit, or after marking done/deleting) or the detected
  // timezone changes.
  useEffect(() => {
    const schedulable = tasks.filter((task) => task.status !== 'done' && task.dueDate)
    if (schedulable.length === 0) {
      setRecommendations({})
      return undefined
    }

    let cancelled = false

    async function loadRecommendations() {
      setRecommendationsLoading(true)
      try {
        const byTaskId = await fetchRecommendations(timezone)
        if (!cancelled) setRecommendations(byTaskId)
      } catch (error) {
        console.error('Failed to load start-time recommendations:', error)
        if (!cancelled) setRecommendations({})
      } finally {
        if (!cancelled) setRecommendationsLoading(false)
      }
    }

    loadRecommendations()

    return () => {
      cancelled = true
    }
  }, [tasks, timezone])

  async function loadTasks() {
    setLoading(true)
    try {
      const response = await authFetch('/api/tasks')
      if (!response.ok) {
        throw new Error('Could not load tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  function handleSaved(updatedTask) {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingId(null)
  }

  async function handleMarkDone(taskId) {
    setActionError('')
    try {
      const response = await authFetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'done' }),
      })
      if (!response.ok) {
        throw new Error('Failed to mark task done')
      }
      const updated = await response.json()
      setTasks((prev) => prev.map((task) => (task.id === updated.id ? updated : task)))
    } catch (error) {
      console.error(error)
      setActionError('Could not mark that task done.')
    }
  }

  async function handleDelete(taskId) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this task? This can’t be undone.')) {
      return
    }

    setActionError('')
    try {
      const response = await authFetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete task')
      }
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
      if (editingId === taskId) setEditingId(null)
    } catch (error) {
      console.error(error)
      setActionError('Could not delete that task.')
    }
  }

  return {
    timezone,
    tasks,
    loading,
    editingId,
    setEditingId,
    recommendations,
    recommendationsLoading,
    actionError,
    handleSaved,
    handleMarkDone,
    handleDelete,
  }
}
