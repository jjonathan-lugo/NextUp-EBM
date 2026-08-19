// Owner: Malika
// Phone-Time Tracker + Correlation page

import Head from 'next/head'
import PhoneTimeLogger from '../components/phone-correlation/PhoneTimeLogger'
import CorrelationChart from '../components/phone-correlation/CorrelationChart'
import RequireAuth from '../components/shared/RequireAuth'
import styles from '../styles/phone-correlation.module.css'

export default function PhoneTracker() {
  return (
    <>
      <Head>
        <title>Phone Tracker | NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>Phone Tracker</h1>

        <RequireAuth>
          <div className={styles.grid}>
            <PhoneTimeLogger />
            <CorrelationChart />
          </div>
        </RequireAuth>
      </main>
    </>
  )
}
