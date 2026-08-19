// MVP feature #4 from the handoff doc — not assigned an owner or a spot
// in the doc's file tree yet. Placed here under shared/ as a starting
// point since it likely combines weighting (J) + start-time (G) output;
// team should confirm ownership and where it renders (candidate: the
// homepage, pages/index.js — flag before editing, it's a shared file).
//
// Shows only the top few recommended tasks by default (choice-overload
// research, see Project Handoff doc), but a "Show more" control lets
// someone who actually wants to plan further ahead see past that
// default instead of being capped at it — useFocusQueue now returns the
// full ranked queue and this component decides how much of it to render.
import { useState } from 'react'
import { useFocusQueue } from '../../hooks/useFocusQueue'
import TaskCard from './TaskCard'
import Button from '../Button'
import styles from './FocusQueue.module.css'

const DEFAULT_VISIBLE = 3
const SHOW_MORE_STEP = 3

export default function FocusQueue() {
  const { tasks, loading } = useFocusQueue()
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE)

  if (loading) {
    return <p>Loading your queue...</p>
  }

  if (tasks.length === 0) {
    return <p>No tasks queued.</p>
  }

  const visibleTasks = tasks.slice(0, visibleCount)
  const remaining = tasks.length - visibleCount
  const isExpanded = visibleCount > DEFAULT_VISIBLE

  return (
    <section>
      <h2>Focus Queue</h2>

      <div className={styles.cardList}>
        {visibleTasks.map((task) => (
          <TaskCard key={task.id} task={task} showWeight />
        ))}
      </div>

      {(remaining > 0 || isExpanded) && (
        <div className={styles.controls}>
          {remaining > 0 && (
            <Button
              variant="ghost"
              onClick={() => setVisibleCount((count) => Math.min(count + SHOW_MORE_STEP, tasks.length))}
            >
              Show {Math.min(SHOW_MORE_STEP, remaining)} more
            </Button>
          )}
          {isExpanded && (
            <Button variant="ghost" onClick={() => setVisibleCount(DEFAULT_VISIBLE)}>
              Show fewer
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
