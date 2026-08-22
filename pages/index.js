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
      "Score a task by effort and priority right when you add it, then work through it with a classic Pomodoro rhythm, or Adaptive mode, which learns how long you are on a task and nudges you if you are on a task for too long.",
    cta: 'Open Focus Timer',
  },
  {
    href: '/smart-start',
    Icon: BoltIcon,
    title: 'Smart Start',
    description:
      "You don't need to decide which task to work on first. NextUp looks at whats due, overdues, and what has the heaviest weight, and tell you exactly what task needs the highest attention plus a second section with anything that has no deadlines.",
    cta: 'Open Smart Start',
  },
  {
    href: '/phone-tracker',
    Icon: PhoneIcon,
    title: 'Phone Tracker',
    description:
      'If you are curious about your productivity this logs how much time you spend on your phone each day and allows you to see how many tasks you actually finished that day. As more entries are logged NextUp will show you a correlation between your phone usage and your productivity.',
    cta: 'Open Phone Tracker',
  }
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
            <span className={styles.eyebrow}>For Anyone Who is Indecisive Stop Thinking Start Doing</span>
            <h1>NextUp</h1>
            <p className={styles.tagline}>Becoming the Most Productive You — Tasks Decided for You.</p>
          </div>
        </div>

        <section className={`${styles.about} ${styles.textMeasure}`}>
          <h2 className={styles.aboutTitle}>Why NextUp</h2>
          <p>
            Open a normal to-do list and you have to re-think what task to start on every single
            time — what's urgent, important, and actually worth the effort right now. That constant thinking is decision fatigue, and it's a
            big part of why people never get started causing them to feel overwhelmed and avoid taking action.
          </p>
          <p>
            NextUp does the deciding instead. Every task gets scored by effort and priority,
            due dates get weighed against how much time you actually have, and instead of a
            normal full list with random tasks, you get tasks that are prioritized for you.
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
