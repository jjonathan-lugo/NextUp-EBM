// Owner: Grace
// API route for the Smart Start feature.
// Calculates a recommended start time based on a deadline and task duration.

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method not allowed',
    })
  }

  const { deadline, duration } = req.body

  if (!deadline || !duration) {
    return res.status(400).json({
      error: 'Please provide a deadline and duration',
    })
  }

  const deadlineTime = new Date(deadline)
  const durationMinutes = Number(duration)

  if (
    Number.isNaN(deadlineTime.getTime()) ||
    Number.isNaN(durationMinutes)
  ) {
    return res.status(400).json({
      error: 'Invalid deadline or duration',
    })
  }

  const startTime = new Date(
    deadlineTime.getTime() - durationMinutes * 60 * 1000
  )

  return res.status(200).json({
    recommendedStartTime: startTime.toISOString(),
  })
}