// Owner: Jonathan Lugo
import { useEffect, useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import { useAuth } from '../../hooks/useAuth'
import { authFetch } from '../../data/authFetch'
import PomodoroMode from './PomodoroMode'
import AdaptiveMode from './AdaptiveMode'
import Button from '../Button'
import styles from '../../styles/focus-weighting.module.css'

export default function FocusTimer() {
  const { user } = useAuth()
  const [mode, setMode] = useState('pomodoro')
  const { seconds, isRunning, start, pause, reset } = useTimer()
  const [tasks, setTasks] = useState([])
  const [selectedTaskId, setSelectedTaskId] = useState('')

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
      try {
        const response = await authFetch('/api/tasks')
        if (!response.ok) {
          throw new Error('Could not load tasks')
        }
        const data = await response.json()
        if (!cancelled) setTasks(data.filter((task) => task.status !== 'done'))
      } catch (error) {
        console.error('Failed to load tasks for Focus Timer:', error)
        if (!cancelled) setTasks([])
      }
    }

    loadTasks()

    return () => {
      cancelled = true
    }
  }, [user])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) || null

  // Switching (or clearing) which task the timer is for starts a fresh
  // session — carrying over elapsed time from a different task would make
  // Adaptive mode's nudge threshold compare against the wrong task's effort.
  function handleSelectTask(taskId) {
    setSelectedTaskId(taskId)
    reset()
  }

  return (
    <section className={styles.card}>
      <h2>Focus Timer</h2>

      {user && (
        <label className={styles.field}>
          Task
          <select value={selectedTaskId} onChange={(e) => handleSelectTask(e.target.value)}>
            <option value="">No task selected</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title} (effort {task.effort})
              </option>
            ))}
          </select>
        </label>
      )}

      <p className={styles.timerDisplay}>{seconds}s</p>

      <div className={styles.controls}>
        <Button onClick={start}>Start</Button>
        <Button onClick={pause}>Pause</Button>
        <Button onClick={reset}>Reset</Button>
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
          />
        )}
      </div>
    </section>
  )
}
