// Shared — coordinate before editing.
// Homepage: per the handoff doc, composes the 3 features with a spot for
// the Focus Queue (top 1-3 recommended tasks, reduces choice overload).
import Head from 'next/head'
import Link from 'next/link'
import FocusQueue from '../components/shared/FocusQueue'
import styles from '../styles/home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>NextUp</title>
      </Head>
      <main className={styles.main}>
        <h1>NextUp</h1>

        <FocusQueue />

        <nav className={styles.nav}>
          <Link href="/focus">Focus Timer + Task Weighting</Link>
          <Link href="/smart-start">Smart Start</Link>
          <Link href="/phone-tracker">Phone Tracker</Link>
        </nav>
      </main>
    </>
  )
}
