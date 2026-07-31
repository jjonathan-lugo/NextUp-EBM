// Owner: Grace
import { useStartTimeAlgorithm } from '../../hooks/useStartTimeAlgorithm'

export default function StartTimeRecommendation() {
  const { recommendedTime, loading } = useStartTimeAlgorithm()

  if (loading) {
    return <p>Calculating your best start time...</p>
  }

  return (
    <section>
      <h2>Recommended Start Time</h2>
      <p>{recommendedTime || 'No recommendation yet'}</p>
    </section>
  )
}
