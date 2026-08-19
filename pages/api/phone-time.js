// Owner: Malika — phone-time API
//
// Backed by data/phoneTimeStore.js (Supabase/Postgres). Every request
// now requires a valid Supabase session — see
// pages/api/tasks/index.js's comment for why (Row Level Security via
// requireUser()).
import { getAllPhoneTimeEntries, addPhoneTimeEntry } from '../../data/phoneTimeStore'
import { requireUser } from '../../data/supabaseServerClient'

export default async function handler(req, res) {
  const auth = await requireUser(req)
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const { supabase } = auth

  switch (req.method) {
    case 'GET': {
      try {
        const entries = await getAllPhoneTimeEntries(supabase)
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
        const entry = await addPhoneTimeEntry(supabase, {
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
