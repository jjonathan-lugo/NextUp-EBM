// Owner: Malika — phone-time API
//
// Now backed by data/phoneTimeStore.js (Supabase/Postgres), replacing the
// `let phoneTimeEntries = []` in-memory array that reset on every server
// restart — same migration data/taskStore.js already went through.
import { getAllPhoneTimeEntries, addPhoneTimeEntry } from '../../data/phoneTimeStore'

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      try {
        const entries = await getAllPhoneTimeEntries()
        return res.status(200).json(entries)
      } catch (error) {
        console.error('Failed to fetch phone-time entries:', error)
        return res.status(500).json({ error: 'Failed to fetch phone-time entries' })
      }
    }

    case 'POST': {
      const { minutes, date } = req.body || {}

      if (typeof minutes !== 'number' || minutes < 0) {
        return res.status(400).json({
          error: 'minutes must be a non-negative number',
        })
      }

      try {
        const entry = await addPhoneTimeEntry({
          minutes,
          date: date || new Date().toISOString(),
        })
        return res.status(201).json(entry)
      } catch (error) {
        console.error('Failed to save phone-time entry:', error)
        return res.status(500).json({ error: 'Failed to save phone-time entry' })
      }
    }

    default:
      res.setHeader('Allow', ['GET', 'POST'])

      return res
        .status(405)
        .end(`Method ${req.method} Not Allowed`)
  }
}
