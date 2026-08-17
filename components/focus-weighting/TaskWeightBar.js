// Owner: Jonathan Lugo
// `max` should match whatever scale the real weight formula in
// data/models/Task.js ends up using (effort 1-5 + priority 1-5 = 2-10
// for a naive sum, but see the TODO there about Eisenhower-style weighting).
import styles from '../../styles/focus-weighting.module.css'

export default function TaskWeightBar({ weight = 0, max = 10 }) {
  const clampedPct = Math.max(0, Math.min(100, (weight / max) * 100))

  return (
    <div
      role="progressbar"
      aria-valuenow={weight}
      aria-valuemin={0}
      aria-valuemax={max}
      className={styles.weightTrack}
    >
      <div className={styles.weightFill} style={{ width: `${clampedPct}%` }} />
    </div>
  )
}
