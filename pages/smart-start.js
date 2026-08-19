// Owner: Grace
// Page route for the Smart Start + Productivity Tips Feed feature.
// Composes components from components/smart-start-feed/*.

import TaskPicker from '../components/smart-start-feed/TaskPicker'
import ProductivityTipsFeed from '../components/smart-start-feed/ProductivityTipsFeed'
import RequireAuth from '../components/shared/RequireAuth'
import styles from '../styles/smart-start-feed.module.css'

// TODO(G): add page metadata (e.g. a <Head> title) once the app title is finalized
function SmartStart() {
  return (
    <main className={styles.main}>
      <h1>Smart Start</h1>
      <RequireAuth>
        <TaskPicker />
      </RequireAuth>
      <ProductivityTipsFeed />
    </main>
  )
}

export default SmartStart