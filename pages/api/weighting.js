// Owner: J — scoring endpoint

// NOTE: mirrors the confirmed formula in hooks/useWeightCalculator.js —
// see that file's comment. Duplicated here rather than extracted to a
// shared module since this was scoped to this file only; worth
// factoring into e.g. lib/weight.js if the formula ever changes, so
// client and server don't drift.
const PRIORITY_WEIGHT = 1.5
const EFFORT_WEIGHT = 0.5

function isValidScore(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 5
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { effort, priority } = req.body || {}

  if (!isValidScore(effort) || !isValidScore(priority)) {
    return res.status(400).json({ error: 'effort and priority must be numbers between 1 and 5' })
  }

  const weight = Math.round((priority * PRIORITY_WEIGHT + effort * EFFORT_WEIGHT) * 10) / 10

  return res.status(200).json({ weight })
}
