// Shared — coordinate before editing; backs the Task list used by all features.

export default function handler(req, res) {
  switch (req.method) {
    case 'GET':
      // TODO: fetch tasks from the database (Postgres vs. Firebase — still
      // an open decision, see the handoff doc)
      return res.status(200).json([])
    case 'POST':
      // TODO: validate req.body against the Task shape (see
      // data/models/Task.js createTask()) and persist it
      return res.status(201).json(null)
    default:
      res.setHeader('Allow', ['GET', 'POST'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
