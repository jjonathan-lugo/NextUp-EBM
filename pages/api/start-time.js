// Owner: Grace — recommendation endpoint
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const now = new Date()
  const recommendedStart = new Date(now.getTime() + 30 * 60 * 1000)

  return res.status(200).json({
    recommendedTime: recommendedStart.toISOString(),
  })
}