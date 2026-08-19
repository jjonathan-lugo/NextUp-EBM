// Owner: J — scoring endpoint

// NOTE: shares the confirmed formula with hooks/useWeightCalculator.js
// via data/weightFormula.js, so client and server can't drift.
import { computeWeight } from '../../data/weightFormula'

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

  const weight = computeWeight(priority, effort)

  return res.status(200).json({ weight })
}
