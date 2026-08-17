// Owner: Jonathan Lugo
import { useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import PomodoroMode from './PomodoroMode'
import AdaptiveMode from './AdaptiveMode'
import Button from '../Button'
import styles from '../../styles/focus-weighting.module.css'

export default function FocusTimer() {
  const [mode, setMode] = useState('pomodoro')
  const { seconds, isRunning, start, pause, reset } = useTimer()

  return (
    <section className={styles.card}>
      <h2>Focus Timer</h2>
      <p className={styles.timerDisplay}>{seconds}s</p>

      {/* TODO(J): buttons call the real start/pause/reset already — this is
          blocked on hooks/useTimer.js actually counting via setInterval */}
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
          <AdaptiveMode seconds={seconds} />
        )}
      </div>
    </section>
  )
}
