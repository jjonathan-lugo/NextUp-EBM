// Owner: Jonathan Lugo
import { useState } from 'react'
import { useTimer } from '../../hooks/useTimer'
import PomodoroMode from './PomodoroMode'
import AdaptiveMode from './AdaptiveMode'
import Button from '../Button'

export default function FocusTimer() {
  const [mode, setMode] = useState('pomodoro')
  const { seconds, isRunning, start, pause, reset } = useTimer()

  return (
    <section>
      <h2>Focus Timer</h2>
      <p>Time: {seconds}s</p>

      {/* TODO(J): buttons call the real start/pause/reset already — this is
          blocked on hooks/useTimer.js actually counting via setInterval */}
      <Button onClick={start}>Start</Button>
      <Button onClick={pause}>Pause</Button>
      <Button onClick={reset}>Reset</Button>

      <div>
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

      {mode === 'pomodoro' ? (
        <PomodoroMode seconds={seconds} />
      ) : (
        <AdaptiveMode seconds={seconds} />
      )}
    </section>
  )
}
