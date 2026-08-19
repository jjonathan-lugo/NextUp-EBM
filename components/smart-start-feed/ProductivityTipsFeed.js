// Owner: Grace
//
// Previously just rendered all 3 hardcoded tips in a static list. Now
// shows one random tip at a time from a bigger pool, drawn by clicking
// the card itself (was a separate "Show another tip" Button below it —
// see styles.tipStack in smart-start-feed.module.css for the card-pile
// visual and why the card is now the whole control).
//
// The random pick happens in an effect, not directly in useState's
// initializer, on purpose: this page is statically prerendered (see the
// build output — /smart-start is a static route), so a Math.random()
// call in the initial render would pick one tip on the server (at build
// time) and a different one on the client, causing a hydration mismatch.
// Starting on a stable default (TIPS[0]) and swapping to a random pick
// once mounted avoids that — same pattern as hooks/useTimezone.js.
import { useEffect, useState } from 'react'
import TipCard from './TipCard'
import styles from '../../styles/smart-start-feed.module.css'

const TIPS = [
  {
    id: 1,
    title: 'Take Short Breaks',
    body: 'Taking short breaks can help you stay focused and avoid burnout.',
  },
  {
    id: 2,
    title: 'Break Tasks Into Steps',
    body: 'Large tasks feel easier when you divide them into smaller steps.',
  },
  {
    id: 3,
    title: 'Put Your Phone Away',
    body: 'Keeping distractions away can help you concentrate on your work.',
  },
  {
    id: 4,
    title: 'Try the Pomodoro Technique',
    body: 'Work in focused 25-minute sprints with a 5-minute break after each one.',
  },
  {
    id: 5,
    title: 'Do the Hardest Task First',
    body: 'Tackling your least appealing task early means everything after it feels lighter.',
  },
  {
    id: 6,
    title: 'One Tab at a Time',
    body: 'Close tabs and apps you’re not actively using — every open tab is a tiny decision waiting to distract you.',
  },
  {
    id: 7,
    title: 'Write Tomorrow’s List Tonight',
    body: 'Deciding what to work on the night before means you can start immediately instead of deciding cold.',
  },
  {
    id: 8,
    title: 'Set a Timer Instead of a Deadline',
    body: 'A vague "finish today" is easy to postpone. A visible 20-minute timer creates urgency right now.',
  },
  {
    id: 9,
    title: 'Batch Similar Tasks',
    body: 'Group emails, errands, or quick replies together instead of context-switching between different kinds of work.',
  },
  {
    id: 10,
    title: 'Two-Minute Rule',
    body: 'If a task takes less than two minutes, do it immediately instead of adding it to a list.',
  },
  {
    id: 11,
    title: 'Change Your Environment',
    body: 'A new location — a library, a different room — can reset your focus when you’re stuck.',
  },
  {
    id: 12,
    title: 'Say the Task Out Loud',
    body: 'Vague tasks ("work on project") stall. Naming the exact next physical action makes starting easier.',
  },
  {
    id: 13,
    title: 'Protect Your Peak Hours',
    body: 'Notice when you focus best during the day and guard that window for your hardest task.',
  },
  {
    id: 14,
    title: 'Don’t Trust Your Memory',
    body: 'Write tasks down the moment they occur to you — remembering them is its own drain on focus.',
  },
  {
    id: 15,
    title: 'Finish Before You Check',
    body: 'Resist checking messages until you complete the task in front of you, not just until you feel like checking.',
  },
]

function pickRandomTip(excludeId) {
  const candidates = excludeId ? TIPS.filter((tip) => tip.id !== excludeId) : TIPS
  return candidates[Math.floor(Math.random() * candidates.length)]
}

export default function ProductivityTipsFeed() {
  const [tip, setTip] = useState(TIPS[0])

  useEffect(() => {
    setTip(pickRandomTip())
  }, [])

  function handleNewTip() {
    setTip((current) => pickRandomTip(current.id))
  }

  // role="button" + tabIndex/onKeyDown make the card itself a real
  // control for keyboard and screen-reader users, not just a clickable
  // <div> that only works with a mouse.
  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleNewTip()
    }
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>Productivity Tips 💡</h2>
      <div
        className={styles.tipStack}
        role="button"
        tabIndex={0}
        onClick={handleNewTip}
        onKeyDown={handleKeyDown}
        aria-label="Show another productivity tip"
      >
        <TipCard key={tip.id} tip={tip} />
      </div>

      {/* Placeholder sections, scaffold-only per the project's stub
          convention (see hooks/useWeightCalculator.js and
          data/models/Task.js for the same pattern elsewhere) — filled
          in visually so this column doesn't trail off into empty space
          next to the (usually taller) decided-task column, but no real
          logic behind them yet. Owner: Grace. */}
      <h2 className={styles.sectionTitle}>Weekly Reflection</h2>
      <div className={styles.stubCard}>
        <span className={styles.stubBadge}>Coming soon</span>
        <p>
          A short summary of what you finished this week.
          {/* TODO(Grace): pull from completed tasks (GET /api/tasks,
              filter status === 'done' + completedAt within the last 7
              days) once there's enough history across users to make a
              weekly summary worth showing. */}
        </p>
      </div>

      <h2 className={styles.sectionTitle}>Focus Streak</h2>
      <div className={styles.stubCard}>
        <span className={styles.stubBadge}>Coming soon</span>
        <p>
          Track consecutive days you've used Smart Start to decide what to work on.
          {/* TODO(Grace): needs a per-day "used Smart Start" log to
              count from — nothing currently records that a visit
              happened, only the tasks themselves. */}
        </p>
      </div>
    </div>
  )
}
