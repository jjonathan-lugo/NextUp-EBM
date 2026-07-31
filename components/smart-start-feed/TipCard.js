// Owner: Grace
export default function TipCard({ tip }) {
  if (!tip) return null

  return (
    <div>
      <h3>{tip.title}</h3>
      <p>{tip.body}</p>
    </div>
  )
}
