// Shared — coordinate before editing; backs the Task list used by all features.

export default function handler(req, res) {
  const { id } = req.query

  switch (req.method) {
    case 'GET':
      // TODO: look up task by id
      return res.status(200).json({ id })
    case 'PUT':
      // TODO: update task by id
      return res.status(200).json({ id, ...req.body })
    case 'DELETE':
      // TODO: delete task by id
      return res.status(204).end()
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE'])
      return res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
