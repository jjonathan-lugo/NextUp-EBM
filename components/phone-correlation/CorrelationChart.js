// Owner: Malika

import { useCorrelationData } from '../../hooks/useCorrelationData'


function calculateCorrelation(data) {
  if (data.length < 2) {
    return 0
  }

  const phone = data.map(item => item.phoneMinutes)
  const tasks = data.map(item => item.completedTasks)

  const phoneMean =
    phone.reduce((sum, value) => sum + value, 0) / phone.length

  const tasksMean =
    tasks.reduce((sum, value) => sum + value, 0) / tasks.length

  let numerator = 0
  let phoneDifference = 0
  let taskDifference = 0

  for (let i = 0; i < data.length; i++) {
    const phoneDiff = phone[i] - phoneMean
    const taskDiff = tasks[i] - tasksMean

    numerator += phoneDiff * taskDiff
    phoneDifference += phoneDiff * phoneDiff
    taskDifference += taskDiff * taskDiff
  }

  const denominator =
    Math.sqrt(phoneDifference * taskDifference)

  if (denominator === 0) {
    return 0
  }

  return numerator / denominator
}


function getCorrelationDescription(value) {
  const strength = Math.abs(value)

  if (strength < 0.2) {
    return 'Very weak relationship'
  }

  if (strength < 0.4) {
    return 'Weak relationship'
  }

  if (strength < 0.7) {
    return 'Moderate relationship'
  }

  return 'Strong relationship'
}


export default function CorrelationChart() {
  const { data, loading } = useCorrelationData()

  if (loading) {
    return <p>Loading correlation data...</p>
  }

  if (data.length < 2) {
    return (
      <section>
        <h2>Phone Time vs. Productivity</h2>
        <p>Not enough data to calculate correlation.</p>
      </section>
    )
  }

  const correlation = calculateCorrelation(data)

  return (
    <section>
      <h2>Phone Time vs. Productivity</h2>

      <div
        style={{
          padding: '20px',
          marginTop: '16px',
          border: '1px solid #ddd',
          borderRadius: '12px'
        }}
      >
        <h3>
          Correlation: {correlation.toFixed(2)}
        </h3>

        <p>
          {getCorrelationDescription(correlation)}
        </p>

        <div
          style={{
            display: 'flex',
            alignItems: 'end',
            gap: '12px',
            height: '220px',
            marginTop: '30px'
          }}
        >
          {data.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'end',
                height: '100%',
                flex: 1
              }}
            >
              <div
                style={{
                  width: '100%',
                  maxWidth: '45px',
                  height: `${Math.max(
                    10,
                    item.completedTasks * 25
                  )}px`,
                  background: '#6366f1',
                  borderRadius: '6px 6px 0 0'
                }}
                title={`${item.completedTasks} completed tasks`}
              />

              <small>
                {item.phoneMinutes}m
              </small>
            </div>
          ))}
        </div>

        <p style={{ marginTop: '15px' }}>
          Each bar represents completed tasks for a day.
          The number below shows phone usage in minutes.
        </p>
      </div>
    </section>
  )
}
