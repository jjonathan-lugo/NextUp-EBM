// Owner: Malika
import { useCorrelationData } from '../../hooks/useCorrelationData'

export default function CorrelationChart() {
  const { data, loading } = useCorrelationData()

  if (loading) {
    return <p>Loading correlation data...</p>
  }

  return (
    <section>
      <h2>Phone Time vs. Productivity</h2>
      {/* TODO(M): render chart, e.g. with a charting library */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  )
}
