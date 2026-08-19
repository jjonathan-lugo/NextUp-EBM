// Owner: Jonathan Lugo
//
// Circular clock face for the Focus Timer's elapsed-time display — was
// a plain "125s" text line (styles.timerDisplay). Purely a different
// presentation of the same `seconds` value FocusTimer.js already had;
// hooks/useTimer.js still owns the actual counting, this just draws it.
//
// The ring sweeps a full circle every 60 seconds and resets, like a
// stopwatch's second hand, rather than trying to represent the whole
// session (Pomodoro's work/break phases and Adaptive mode's
// personalized threshold have different, mode-specific "full" lengths
// — see PomodoroMode.js / AdaptiveMode.js — so a single shared ring
// here sticks to the one duration that means the same thing in both
// modes: a minute).
import styles from '../../styles/focus-weighting.module.css'

const SIZE = 200
const CENTER = SIZE / 2
const RING_RADIUS = 82
const TICK_COUNT = 12

function formatClock(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export default function TimerClock({ seconds = 0, isRunning = false }) {
  const secondsIntoMinute = seconds % 60
  const fraction = secondsIntoMinute / 60

  return (
    <div className={styles.clockWrap}>
      <svg
        className={isRunning ? `${styles.clockFace} ${styles.clockFaceRunning}` : styles.clockFace}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Timer: ${formatClock(seconds)} elapsed`}
      >
        {/* Tick marks — every 3rd (the 12/3/6/9 o'clock positions) drawn
            longer, like the numbered marks on a real clock face. */}
        {Array.from({ length: TICK_COUNT }, (_, i) => {
          const isMajor = i % 3 === 0
          const outer = RING_RADIUS - 10
          const inner = isMajor ? outer - 10 : outer - 6
          return (
            <line
              key={i}
              x1={CENTER}
              y1={CENTER - outer}
              x2={CENTER}
              y2={CENTER - inner}
              className={isMajor ? styles.tickMajor : styles.tickMinor}
              transform={`rotate(${i * (360 / TICK_COUNT)} ${CENTER} ${CENTER})`}
            />
          )
        })}

        <circle className={styles.clockTrack} cx={CENTER} cy={CENTER} r={RING_RADIUS} />

        {/* pathLength=100 normalizes the circle's length to 100 units, so
            the dash offset below is just "percent remaining" instead of
            needing the actual circumference (2 * PI * RING_RADIUS). */}
        <circle
          className={styles.clockProgress}
          cx={CENTER}
          cy={CENTER}
          r={RING_RADIUS}
          pathLength={100}
          strokeDasharray={100}
          strokeDashoffset={100 - fraction * 100}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        />

        <text x={CENTER} y={CENTER} className={styles.clockTime} textAnchor="middle" dominantBaseline="middle">
          {formatClock(seconds)}
        </text>
      </svg>
    </div>
  )
}
