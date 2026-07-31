// Owner: M — correlation endpoint

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      // TODO(M): fetch logged phone-time entries from the database
      return res.status(200).json([])
    case 'POST':
      // TODO(M): validate and persist the phone-time entry
      return res.status(201).json(null)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
