// Owner: Grace
// Page route for the Smart Start + Productivity Tips Feed feature.
// Composes components from components/smart-start-feed/*.
//
// useTaskManagement() is called once, here, and passed down as props to
// both TaskPicker (the decision cards, left column) and AllTasksList
// (the full list, now stacked under Productivity Tips in the right
// column instead of trailing the decision cards) — see the hook's own
// comment for why calling it in two places instead would desync the
// two views. It's called unconditionally (outside RequireAuth) because
// the hook itself already no-ops while signed out; RequireAuth still
// gates what actually *renders* from it.

import Head from 'next/head'
import TaskPicker from '../components/smart-start-feed/TaskPicker'
import AllTasksList from '../components/smart-start-feed/AllTasksList'
import ProductivityTipsFeed from '../components/smart-start-feed/ProductivityTipsFeed'
import RequireAuth from '../components/shared/RequireAuth'
import { useTaskManagement } from '../hooks/useTaskManagement'
import styles from '../styles/smart-start-feed.module.css'

// Matches the "<Page> | NextUp" pattern already used by pages/focus.js.
function SmartStart() {
  const taskManagement = useTaskManagement()

  return (
    <>
      <Head>
        <title>Smart Start | NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>Smart Start</h1>
        <div className={styles.grid}>
          <RequireAuth>
            <TaskPicker {...taskManagement} />
          </RequireAuth>
          <div>
            <ProductivityTipsFeed />
            <RequireAuth>
              <AllTasksList {...taskManagement} />
            </RequireAuth>
          </div>
        </div>
      </main>
    </>
  )
}

export default SmartStart