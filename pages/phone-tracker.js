// Owner: Malika
// Phone-Time Tracker + Correlation page

import PhoneTimeLogger from '../components/phone-correlation/PhoneTimeLogger'
import CorrelationChart from '../components/phone-correlation/CorrelationChart'
import styles from '../styles/phone-correlation.module.css'

export default function PhoneTracker() {
  return (
    <main className={styles.main}>
      <h1>Phone Tracker</h1>

      <PhoneTimeLogger />

      <CorrelationChart />
    </main>
  )
}
