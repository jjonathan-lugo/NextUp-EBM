// Owner: Jonathan
// Page route for the Focus Timer + Task Weighting feature.
// Composes components from components/focus-weighting/*.

import Head from 'next/head'
import FocusTimer from '../components/focus-weighting/FocusTimer'
import WeightingForm from '../components/focus-weighting/WeightingForm'
import RequireAuth from '../components/shared/RequireAuth'
import styles from '../styles/focus-weighting.module.css'

// TODO(J): add a loading/error state while FocusTimer and WeightingForm
// are fetching/computing data, instead of rendering them blank — not
// implemented here since neither actually fetches anything async right
// now (useTimer and useWeightCalculator are both synchronous local
// state). Revisit once one of them calls a real API, e.g. pages/api/weighting.js.
function Focus() {
  return (
    <>
      <Head>
        <title>Focus | NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>Focus</h1>
        <FocusTimer />
        <RequireAuth>
          <WeightingForm />
        </RequireAuth>
      </main>
    </>
  )
}

export default Focus
