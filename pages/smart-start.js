// Owner: Grace
// Page route for the Smart Start + Productivity Tips Feed feature.
// Composes components from components/smart-start-feed/*.

import StartTimeRecommendation from '../components/smart-start-feed/StartTimeRecommendation'
import ProductivityTipsFeed from '../components/smart-start-feed/ProductivityTipsFeed'
import styles from '../styles/smart-start-feed.module.css'

// TODO(G): add a loading/error state while StartTimeRecommendation and
// ProductivityTipsFeed are fetching data, instead of rendering them blank
// TODO(G): add page metadata (e.g. a <Head> title) once the app title is finalized
function SmartStart() {
  return (
    <main className={styles.main}>
      <h1>Smart Start</h1>
      <StartTimeRecommendation />
      <ProductivityTipsFeed />
    </main>
  )
}

export default SmartStart
