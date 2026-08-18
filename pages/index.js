import StartTimeRecommendation from '../components/smart-start-feed/StartTimeRecommendation'
import ProductivityTipsFeed from '../components/smart-start-feed/ProductivityTipsFeed'
import styles from '../styles/smart-start-feed.module.css'

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