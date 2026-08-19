// MVP feature #4 from the handoff doc — not assigned an owner or a spot
// in the doc's file tree yet. Placed here under shared/ as a starting
// point since it likely combines weighting (J) + start-time (G) output;
// team should confirm ownership and where it renders (candidate: the
// homepage, pages/index.js — flag before editing, it's a shared file).
//
// Shows PAGE_SIZE recommended tasks at a time, side by side, with left/
// right arrows to page through the rest — was "Show 3 more" / "Show
// fewer" buttons that grew a single stacked column taller each click;
// this instead pages through fixed-size groups laid out horizontally.
// useFocusQueue still returns the full ranked queue; this component
// just decides how it's paged/displayed.
import { useState } from 'react'
import { useFocusQueue } from '../../hooks/useFocusQueue'
import TaskCard from './TaskCard'
import styles from './FocusQueue.module.css'

const PAGE_SIZE = 3

export default function FocusQueue() {
  const { tasks, loading } = useFocusQueue()
  const [pageIndex, setPageIndex] = useState(0)

  if (loading) {
    return <p>Loading your queue...</p>
  }

  if (tasks.length === 0) {
    return <p>No tasks queued.</p>
  }

  const totalPages = Math.ceil(tasks.length / PAGE_SIZE)
  const start = pageIndex * PAGE_SIZE
  const visibleTasks = tasks.slice(start, start + PAGE_SIZE)
  const canGoBack = pageIndex > 0
  const canGoForward = pageIndex < totalPages - 1

  return (
    <section>
      <h2>Focus Queue</h2>

      <div className={styles.carousel}>
        <button
          type="button"
          className={styles.arrow}
          onClick={() => setPageIndex((index) => index - 1)}
          disabled={!canGoBack}
          aria-label="Show previous tasks"
        >
          ‹
        </button>

        <div className={styles.cardList}>
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} showWeight />
          ))}
        </div>

        <button
          type="button"
          className={styles.arrow}
          onClick={() => setPageIndex((index) => index + 1)}
          disabled={!canGoForward}
          aria-label="Show more tasks"
        >
          ›
        </button>
      </div>

      {totalPages > 1 && (
        <p className={styles.pageIndicator}>
          {pageIndex + 1} of {totalPages}
        </p>
      )}
    </section>
  )
}
