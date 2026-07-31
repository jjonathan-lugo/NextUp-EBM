// Owner: Malika
// Page route for the Phone-Time Tracker + Correlation feature.
// Composes components from components/phone-correlation/*.

import PhoneTimeLogger from '../components/phone-correlation/PhoneTimeLogger'
import CorrelationChart from '../components/phone-correlation/CorrelationChart'
import styles from '../styles/phone-correlation.module.css'

// TODO(M): add a loading/error state while PhoneTimeLogger and
// CorrelationChart are fetching data, instead of rendering them blank
// TODO(M): add page metadata (e.g. a <Head> title) once the app title is finalized
function PhoneTracker() {
  return (
    <main className={styles.main}>
      <h1>Phone Tracker</h1>
      <PhoneTimeLogger />
      <CorrelationChart />
    </main>
  )
}

export default PhoneTracker
