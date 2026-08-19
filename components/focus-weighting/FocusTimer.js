// Owner: Jonathan Lugo
import { useEffect, useRef, useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { useAuth } from '../../hooks/useAuth'
import { authFetch } from '../../data/authFetch'
import TaskCard from '../shared/TaskCard'
import TimerClock from './TimerClock'
import PomodoroMode from './PomodoroMode'
import AdaptiveMode from './AdaptiveMode'
import Button from '../Button'
import styles from '../../styles/focus-weighting.module.css'

export default function FocusTimer() {
  const { user } = useAuth()
  const [mode, setMode] = useState('pomodoro')
  const { seconds, isRunning, start, pause, reset } = useTimer()
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState('')

  // How much of the current `seconds` count has already been saved to the
  // backend — only the difference gets sent on the next commit, so
  // pausing and resuming repeatedly within one task doesn't double-count.
  // A ref because it's bookkeeping for the commit logic below, not
  // something that should itself trigger a re-render.
  const committedSecondsRef = useRef(0)

  // Task picker only works signed in (tasks are per-user) — doesn't block
  // the timer itself, which still works fine with no task selected
  // (Adaptive mode just falls back to its effort-1 default in that case).
  useEffect(() => {
    if (!user) {
      setTasks([])
      setSelectedTaskId('')
      return undefined
    }

    let cancelled = false

    async function loadTasks() {
      setTasksLoading(true)
      try {
        const response = await authFetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Could not load tasks')
        }
        const data = await response.json()
        // Unlike before, this keeps done tasks too — AdaptiveMode needs
        // the user's completed-task history (with logged timeSpentSeconds)
        // to personalize its nudge threshold. The task PICKER below still
        // only offers non-done tasks; see `openTasks`.
        if (!cancelled) setTasks(data)
      } catch (error) {
        console.error('Failed to load tasks for Focus Timer:', error)
        if (!cancelled) setTasks([])
      } finally {
        if (!cancelled) setTasksLoading(false)
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [user])

  const openTasks = tasks.filter((task) => task.status !== 'done')
  const selectedTask = openTasks.find((task) => task.id === selectedTaskId) || null

  // Adds however much of `seconds` hasn't been saved yet onto the
  // selected task's timeSpentSeconds. Fire-and-forget from the caller's
  // point of view (errors are logged, not surfaced — losing a save here
  // shouldn't block pausing/resetting/switching the timer itself), but
  // callers still read `seconds`/`selectedTask` synchronously before this
  // resolves, since committedSecondsRef is only updated by the caller,
  // not by this function, to avoid a race with an immediately-following
  // reset (see handleReset/handleSelectTask).
  async function saveElapsedTime(task, deltaSeconds) {
    if (!task || deltaSeconds <= 0) return
    try {
      const response = await authFetch(`/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeSpentSeconds: (task.timeSpentSeconds ?? 0) + deltaSeconds }),
      })
      if (!response.ok) {
        throw new Error('Failed to save time spent')
      }
      const updated = await response.json()
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
    } catch (error) {
      console.error('Failed to save time spent:', error)
    }
  }

  function commitPendingTime() {
    const delta = seconds - committedSecondsRef.current
    if (selectedTask && delta > 0) {
      saveElapsedTime(selectedTask, delta)
    }
  }

  function handlePause() {
    pause()
    commitPendingTime()
    committedSecondsRef.current = seconds
  }

  function handleReset() {
    commitPendingTime()
    reset()
    committedSecondsRef.current = 0
  }

  // Switching (or clearing) which task the timer is for flushes whatever
  // time had built up on the task being switched away from, then starts a
  // fresh session — carrying elapsed time over to a different task would
  // both misattribute that time and make Adaptive mode's nudge threshold
  // compare against the wrong task's effort.
  function handleSelectTask(taskId) {
    commitPendingTime()
    setSelectedTaskId(taskId)
    reset()
    committedSecondsRef.current = 0
  }

  return (
    <section className={styles.card}>
      <h2>Focus Timer</h2>

      {user && (
        <label className={styles.field}>
          Task
          {tasksLoading ? (
            <span className={styles.hint}>Loading tasks...</span>
          ) : (
            <select value={selectedTaskId} onChange={(e) => handleSelectTask(e.target.value)}>
              <option value="">No task selected</option>
              {openTasks.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.title} (effort {task.effort})
                </option>
              ))}
            </select>
          )}
        </label>
      )}

      {selectedTask && <TaskCard task={selectedTask} showTimer />}

      <TimerClock seconds={seconds} isRunning={isRunning} />

      <div className={styles.controls}>
        <Button onClick={start}>Start</Button>
        <Button onClick={handlePause}>Pause</Button>
        <Button onClick={handleReset}>Reset</Button>
      </div>

      <div className={styles.modeToggle}>
        <Button
          onClick={() => setMode('pomodoro')}
          disabled={mode === 'pomodoro'}
          aria-pressed={mode === 'pomodoro'}
        >
          Pomodoro
        </Button>
        <Button
          onClick={() => setMode('adaptive')}
          disabled={mode === 'adaptive'}
          aria-pressed={mode === 'adaptive'}
        >
          Adaptive
        </Button>
      </div>

      <div className={styles.modeBody}>
        {mode === 'pomodoro' ? (
          <PomodoroMode seconds={seconds} />
        ) : (
          <AdaptiveMode
            seconds={seconds}
            effort={selectedTask?.effort ?? 1}
            taskTitle={selectedTask?.title ?? ''}
            historicalTasks={tasks}
          />
        )}
      </div>
    </section>
  )
}
