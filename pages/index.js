// Shared — coordinate before editing.
// Homepage: per the handoff doc, composes the 3 features with a spot for
// the Focus Queue (top 1-3 recommended tasks, reduces choice overload).
//
// Redesigned as a landing page, not just a router — leads with why the
// app exists (decision fatigue / choice overload, the actual design
// rationale behind the whole product, previously only living in the
// project handoff doc, not visible anywhere in the app itself), then
// each feature gets a described card instead of a bare link, so a
// first-time visitor understands what they're about to open before they
// open it.
import Head from 'next/head'
import Link from 'next/link'
import FocusQueue from '../components/shared/FocusQueue'
import RequireAuth from '../components/shared/RequireAuth'
import { TimerIcon, BoltIcon, PhoneIcon } from '../components/shared/icons'
import styles from '../styles/home.module.css'

const FEATURES = [
  {
    href: '/focus',
    Icon: TimerIcon,
    title: 'Focus Timer + Task Weighting',
    description:
      "Score a task by effort and priority the moment you add it, then work through it with a timer — a classic Pomodoro rhythm, or Adaptive mode, which learns how long tasks like this one actually take you and nudges you accordingly instead of guessing.",
    cta: 'Open Focus Timer',
  },
  {
    href: '/smart-start',
    Icon: BoltIcon,
    title: 'Smart Start',
    description:
      "No list to scroll, no decision to make. NextUp looks at what's due, what's overdue, and what's heaviest, and hands you exactly one task to start right now — plus a second pick for anything with no deadline at all.",
    cta: 'Open Smart Start',
  },
  {
    href: '/phone-tracker',
    Icon: PhoneIcon,
    title: 'Phone Tracker',
    description:
      'Log how much time you spend on your phone each day and see it laid out next to how many tasks you actually finished — a plain look at the relationship, not a lecture about it.',
    cta: 'Open Phone Tracker',
  },
]

export default function Home() {
  return (
    <>
      <Head>
        <title>NextUp</title>
      </Head>
      <main className={styles.main}>
        <div className={styles.hero}>
          <div className={styles.textMeasure}>
            <span className={styles.eyebrow}>For anyone who reaches for their phone instead of deciding</span>
            <h1>NextUp</h1>
            <p className={styles.tagline}>One task at a time — decided for you.</p>
          </div>
        </div>

        <section className={`${styles.about} ${styles.textMeasure}`}>
          <h2 className={styles.aboutTitle}>Why NextUp</h2>
          <p>
            Open a normal to-do list and you have to re-decide what matters every single
            time — what&apos;s urgent, what&apos;s important, what&apos;s actually worth the
            effort right now. That constant re-deciding is decision fatigue, and it&apos;s a
            big part of why phones win: scrolling asks nothing of you.
          </p>
          <p>
            NextUp does the deciding instead. Every task gets scored by effort and priority,
            due dates get weighed against how much time you actually have, and instead of a
            full list, you get one task to start next.
          </p>
        </section>

        <RequireAuth>
          <section className={`${styles.queueSection} ${styles.textMeasure}`}>
            <p className={styles.queueLead}>
              Your Focus Queue — the next few tasks NextUp has already picked for you, ranked
              by urgency and weight.
            </p>
            <FocusQueue />
          </section>
        </RequireAuth>

        <section className={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <Link key={feature.href} href={feature.href} className={styles.featureCard}>
              <span className={styles.featureIcon}>
                <feature.Icon />
              </span>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
              <span className={styles.featureCta}>{feature.cta} →</span>
            </Link>
          ))}
        </section>
      </main>
    </>
  )
}
