// Owner: Jonathan Lugo
// `max` matches the confirmed weight formula's range — data/weightFormula.js
// scales priority*1.5 + effort*0.5 (each 1-5) to land in 2-10.
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
