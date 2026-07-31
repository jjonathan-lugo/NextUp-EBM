// Owner: Jonathan
// Page route for the Focus Timer + Task Weighting feature.
// Composes components from components/focus-weighting/*.

import FocusTimer from '../components/focus-weighting/FocusTimer'
import WeightingForm from '../components/focus-weighting/WeightingForm'
import styles from '../styles/focus-weighting.module.css'

// TODO(J): add a loading/error state while FocusTimer and WeightingForm
// are fetching/computing data, instead of rendering them blank
// TODO(J): add page metadata (e.g. a <Head> title) once the app title is finalized
function Focus() {
  return (
    <main className={styles.main}>
      <h1>Focus</h1>
      <FocusTimer />
      <WeightingForm />
    </main>
  )
}

export default Focus
