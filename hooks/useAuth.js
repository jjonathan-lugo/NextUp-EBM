// Wraps Supabase's client-side session state. Exposes the signed-in
// user (or null while signed out), a loading flag for the initial
// session check on mount, and signInWithGoogle/signOut actions.
import { useEffect, useState } from 'react'
import { supabase } from '../data/supabaseClient'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase.auth.getSession().then(({ data }) => {
      if (!cancelled) {
        setUser(data.session?.user ?? null)
        setLoading(false)
      }
    })

    // Keeps `user` in sync after sign-in/sign-out and when Supabase
    // refreshes the access token in the background.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      cancelled = true
      listener.subscription.unsubscribe()
    }
  }, [])

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    })
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, loading, signInWithGoogle, signOut }
}
