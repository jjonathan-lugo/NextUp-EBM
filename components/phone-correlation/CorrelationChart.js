// Owner: Malika

import { useCorrelationData } from '../../hooks/useCorrelationData'

function calculateCorrelation(data) {
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

function getStrength(correlation) {
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
      <section>
        <h2>Phone Time vs. Productivity</h2>
        <p>Loading correlation data...</p>
      </section>
    )
  }

  if (data.length < 2) {
    return (
      <section>
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
    <section>
      <h2>Phone Time vs. Productivity</h2>

      <div
        style={{
          padding: '20px',
          marginTop: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px',
        }}
      >
        <h3>
          Correlation:{' '}
          {correlation.toFixed(2)}
        </h3>

        <p>
          Relationship strength:{' '}
          <strong>{strength}</strong>
        </p>

        <div
          style={{
            display: 'grid',
            gap: '10px',
            marginTop: '20px',
          }}
        >
          {data.map((item, index) => (
            <div
              key={`${item.date}-${index}`}
              style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '8px',
              }}
            >
              <strong>{item.date}</strong>

              <div>
                Phone time:{' '}
                {item.phoneMinutes} minutes
              </div>

              <div>
                Completed tasks:{' '}
                {item.completedTasks}
              </div>
            </div>
          ))}
        </div>

        <p
          style={{
            marginTop: '20px',
            fontSize: '14px',
            color: '#666',
          }}
        >
          A positive correlation means phone
          time and completed tasks tend to
          increase together. A negative
          correlation means they tend to move
          in opposite directions.
        </p>

        <p
          style={{
            fontSize: '13px',
            color: '#777',
          }}
        >
          Correlation shows an association;
          it does not prove causation.
        </p>
      </div>
    </section>
  )
}
