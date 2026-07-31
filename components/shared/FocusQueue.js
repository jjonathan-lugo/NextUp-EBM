// MVP feature #4 from the handoff doc — not assigned an owner or a spot
// in the doc's file tree yet. Placed here under shared/ as a starting
// point since it likely combines weighting (J) + start-time (G) output;
// team should confirm ownership and where it renders (candidate: the
// homepage, pages/index.js — flag before editing, it's a shared file).
//
// Shows only the top 1-3 recommended tasks at a time instead of a full
// list, applying choice-overload research (see Project Handoff doc).

import { useFocusQueue } from '../../hooks/useFocusQueue'
import TaskCard from './TaskCard'

export default function FocusQueue() {
  const { tasks, loading } = useFocusQueue()

  if (loading) {
    return <p>Loading your queue...</p>
  }

  if (tasks.length === 0) {
    return <p>No tasks queued.</p>
  }

  return (
    <section>
      <h2>Focus Queue</h2>
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} showWeight />
      ))}
    </section>
  )
}
