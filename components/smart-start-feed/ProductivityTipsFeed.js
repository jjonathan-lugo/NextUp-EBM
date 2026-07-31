// Owner: Grace
import { useState, useEffect } from 'react'
import TipCard from './TipCard'

export default function ProductivityTipsFeed() {
  const [tips, setTips] = useState([])

  useEffect(() => {
    // TODO(G): fetch tips from an API or static source
    setTips([])
  }, [])

  return (
    <section>
      <h2>Productivity Tips</h2>
      {tips.length === 0 ? (
        <p>No tips yet.</p>
      ) : (
        tips.map((tip) => <TipCard key={tip.id} tip={tip} />)
      )}
    </section>
  )
}
