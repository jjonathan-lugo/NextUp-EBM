// Shared — coordinate before editing. Gates any data-dependent feature
// behind a signed-in session — every /api/tasks, /api/phone-time, and
// /api/start-time request now requires auth (see
// data/supabaseServerClient.js), so without this a signed-out visitor
// would just see generic fetch-failure messages ("Could not load
// tasks") instead of a clear reason and a way to fix it.
import { useAuth } from '../../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <p>Loading...</p>
  }

  if (!user) {
    return <p>Sign in (top right) to use this.</p>
  }

  return children
}
