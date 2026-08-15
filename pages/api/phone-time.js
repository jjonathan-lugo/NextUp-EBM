// Owner: Malika — phone-time API

let phoneTimeEntries = []

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      return res.status(200).json(phoneTimeEntries)

    case 'POST': {
      const { minutes, date } = req.body

      if (
        typeof minutes !== 'number' ||
        minutes < 0
      ) {
        return res.status(400).json({
          error: 'minutes must be a non-negative number',
        })
      }

      const entry = {
        id: Date.now().toString(),
        minutes,
        date: date || new Date().toISOString(),
      }

      phoneTimeEntries.push(entry)

      return res.status(201).json(entry)
    }

    default:
      res.setHeader('Allow', ['GET', 'POST'])

      return res
        .status(405)
        .end(`Method ${req.method} Not Allowed`)
  }
}
