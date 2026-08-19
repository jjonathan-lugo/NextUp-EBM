// Owner: Grace
// Page route for the Smart Start + Productivity Tips Feed feature.
// Composes components from components/smart-start-feed/*.

import Head from 'next/head'
import TaskPicker from '../components/smart-start-feed/TaskPicker'
import ProductivityTipsFeed from '../components/smart-start-feed/ProductivityTipsFeed'
import RequireAuth from '../components/shared/RequireAuth'
import styles from '../styles/smart-start-feed.module.css'

// Matches the "<Page> | NextUp" pattern already used by pages/focus.js.
function SmartStart() {
  return (
    <>
      <Head>
        <title>Smart Start | NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>Smart Start</h1>
        <div className={styles.grid}>
          <RequireAuth>
            <TaskPicker />
          </RequireAuth>
          <ProductivityTipsFeed />
        </div>
      </main>
    </>
  )
}

export default SmartStart