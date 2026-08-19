// Owner: Grace
//
// The full task list — every task, with edit/mark-done/delete actions —
// split out of TaskPicker.js so it can render in its own spot on the
// page: directly under Productivity Tips (see pages/smart-start.js),
// instead of always trailing the two decision cards. Reuses
// EditTaskForm/UrgencyBadge/describeRecommendation exported from
// TaskPicker.js so a row here looks and behaves identically to before —
// same edit form, same urgency badge, same recommendation text.
//
// Shares task state with TaskPicker via hooks/useTaskManagement.js
// (called once in pages/smart-start.js, passed to both as props), so
// marking a task done or deleting it here immediately updates the
// decision cards too, instead of the two views drifting out of sync.
//
// Renders inside its own scrollable panel (.taskList in
// smart-start-feed.module.css) so a long list doesn't push the rest of
// the page down.
import Button from '../Button'
import { EditTaskForm, UrgencyBadge, describeRecommendation } from './TaskPicker'
import styles from '../../styles/smart-start-feed.module.css'

export default function AllTasksList({
  tasks,
  loading,
  editingId,
  setEditingId,
  recommendations,
  recommendationsLoading,
  timezone,
  handleSaved,
  handleMarkDone,
  handleDelete,
}) {
  if (loading) {
    return (
      <div>
        <h2 className={styles.sectionTitle}>All Tasks</h2>
        <p className={styles.emptyState}>Loading tasks...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className={styles.sectionTitle}>All Tasks</h2>
      <ul className={styles.taskList}>
        {tasks.map((task) =>
          editingId === task.id ? (
            <li key={task.id} className={styles.taskRow}>
              <EditTaskForm
                task={task}
                timezone={timezone}
                onCancel={() => setEditingId(null)}
                onSaved={handleSaved}
              />
            </li>
          ) : (
            <li key={task.id} className={styles.taskRow}>
              {task.status !== 'done' && (
                <UrgencyBadge task={task} recommendation={recommendations[task.id]} timezone={timezone} />
              )}
              <span
                className={
                  task.status === 'done'
                    ? `${styles.taskTitle} ${styles.taskDone}`
                    : styles.taskTitle
                }
              >
                {task.title}
              </span>
              <span className={styles.taskMeta}>
                {'Weight: '}
                {task.weight ?? '—'}
                {' — '}
                {describeRecommendation(task, recommendations[task.id], timezone, recommendationsLoading)}
              </span>
              <div className={styles.taskActions}>
                <Button variant="ghost" onClick={() => setEditingId(task.id)}>Edit</Button>
                {task.status !== 'done' && (
                  <Button variant="success" onClick={() => handleMarkDone(task.id)}>Mark done</Button>
                )}
                <Button variant="danger" onClick={() => handleDelete(task.id)}>Delete</Button>
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  )
}
