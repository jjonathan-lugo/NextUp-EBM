// Owner: Jonathan
// Page route for the Focus Timer + Task Weighting feature.
// Composes components from components/focus-weighting/*.

import Head from 'next/head'
import FocusTimer from '../components/focus-weighting/FocusTimer'
import WeightingForm from '../components/focus-weighting/WeightingForm'
import RequireAuth from '../components/shared/RequireAuth'
import styles from '../styles/focus-weighting.module.css'

// FocusTimer now fetches the signed-in user's tasks for its task picker,
// so it handles its own loading state internally (see its `tasksLoading`)
// rather than this page needing to orchestrate one. WeightingForm still
// has no async fetch on mount (useWeightCalculator is synchronous local
// state) — it just POSTs on Save, which its own `saving` state already covers.
function Focus() {
  return (
    <>
      <Head>
        <title>Focus | NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>Focus</h1>
        <div className={styles.grid}>
          <FocusTimer />
          <RequireAuth>
            <WeightingForm />
          </RequireAuth>
        </div>
      </main>
    </>
  )
}

export default Focus
