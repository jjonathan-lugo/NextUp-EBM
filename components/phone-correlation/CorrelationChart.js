// Owner: Malika

import { useCorrelationData } from '../../hooks/useCorrelationData'
import styles from '../../styles/phone-correlation.module.css'

// Mirrors the hours+minutes input in PhoneTimeLogger.js — showing "2h
// 30m" instead of a bare "150 minutes" serves the same readability goal
// on the way back out.
// Exported (along with calculateCorrelation/getStrength below) so the
// math can be unit tested directly instead of only indirectly through
// the rendered component — see data/__tests__/correlationChart.test.js.
export function formatDuration(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export function calculateCorrelation(data) {
  if (data.length < 2) {
    return 0
  }

  const phoneTimes = data.map(
    (item) => item.phoneMinutes
  )

  const completedTasks = data.map(
    (item) => item.completedTasks
  )

  const phoneMean =
    phoneTimes.reduce(
      (sum, value) => sum + value,
      0
    ) / phoneTimes.length

  const tasksMean =
    completedTasks.reduce(
      (sum, value) => sum + value,
      0
    ) / completedTasks.length

  let numerator = 0
  let phoneVariance = 0
  let tasksVariance = 0

  for (let i = 0; i < data.length; i++) {
    const phoneDifference =
      phoneTimes[i] - phoneMean

    const taskDifference =
      completedTasks[i] - tasksMean

    numerator +=
      phoneDifference * taskDifference

    phoneVariance +=
      phoneDifference ** 2

    tasksVariance +=
      taskDifference ** 2
  }

  const denominator = Math.sqrt(
    phoneVariance * tasksVariance
  )

  if (denominator === 0) {
    return 0
  }

  return numerator / denominator
}

export function getStrength(correlation) {
  const value = Math.abs(correlation)

  if (value < 0.2) {
    return 'Very weak'
  }

  if (value < 0.4) {
    return 'Weak'
  }

  if (value < 0.7) {
    return 'Moderate'
  }

  return 'Strong'
}

export default function CorrelationChart() {
  const { data, loading } =
    useCorrelationData()

  if (loading) {
    return (
      <section className={styles.card}>
        <h2>Phone Time vs. Productivity</h2>
        <p>Loading correlation data...</p>
      </section>
    )
  }

  if (data.length < 2) {
    return (
      <section className={styles.card}>
        <h2>Phone Time vs. Productivity</h2>

        <p>
          Add at least two phone-time entries
          to calculate a correlation.
        </p>
      </section>
    )
  }

  const correlation =
    calculateCorrelation(data)

  const strength =
    getStrength(correlation)

  return (
    <section className={styles.card}>
      <h2>Phone Time vs. Productivity</h2>

      <div className={styles.summary}>
        <h3 className={styles.correlationValue}>
          Correlation:{' '}
          {correlation.toFixed(2)}
        </h3>

        <p>
          Relationship strength:{' '}
          <strong>{strength}</strong>
        </p>

        <div className={styles.dayList}>
          {data.map((item, index) => (
            <div
              key={`${item.date}-${index}`}
              className={styles.dayRow}
            >
              <div className={styles.dayLabel}>{item.date}</div>

              <div>
                Phone time:{' '}
                {formatDuration(item.phoneMinutes)}
              </div>

              <div>
                Completed tasks:{' '}
                {item.completedTasks}
              </div>
            </div>
          ))}
        </div>

        <p className={styles.explainer}>
          A positive correlation means phone
          time and completed tasks tend to
          increase together. A negative
          correlation means they tend to move
          in opposite directions.
        </p>

        <p className={styles.disclaimer}>
          Correlation shows an association;
          it does not prove causation.
        </p>
      </div>
    </section>
  )
}
