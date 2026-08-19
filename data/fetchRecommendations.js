// Client-side helper shared by TaskPicker.js (Smart Start) and
// useFocusQueue.js (homepage) — both need the same batch call to
// /api/start-time and the same taskId -> recommendation map shape, so
// this exists once instead of twice.
export async function fetchRecommendations(timezone) {
  const response = await fetch('/api/start-time', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timezone }),
  })

  if (!response.ok) {
    throw new Error('Could not load recommendations')
  }

  const data = await response.json()
  const byTaskId = {}
  for (const recommendation of data.recommendations || []) {
    byTaskId[recommendation.taskId] = recommendation
  }
  return byTaskId
}
