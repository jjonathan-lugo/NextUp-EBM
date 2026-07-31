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

      {/* TODO(J): useTimer doesn't count yet — wire these up once it does */}
      <Button onClick={start}>Start</Button>
      <Button onClick={pause}>Pause</Button>
      <Button onClick={reset}>Reset</Button>

      <div>
        {/* TODO(J): show which mode is active (e.g. disable/highlight it) */}
        <Button onClick={() => setMode('pomodoro')}>Pomodoro</Button>
        <Button onClick={() => setMode('adaptive')}>Adaptive</Button>
      </div>

      {mode === 'pomodoro' ? <PomodoroMode /> : <AdaptiveMode />}
    </section>
  )
}
