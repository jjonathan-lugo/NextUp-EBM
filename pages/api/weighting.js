// Owner: J — scoring endpoint

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const { effort, priority } = req.body || {}
  // TODO(J): compute the real weight — see hooks/useWeightCalculator.js
  const weight = null

  return res.status(200).json({ weight })
}
