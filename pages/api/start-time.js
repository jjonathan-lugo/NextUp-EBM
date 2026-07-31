// Owner: G — recommendation endpoint

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // TODO(G): compute recommended start time from task/history data
  return res.status(200).json({ recommendedTime: null })
}
