// Shared — coordinate before editing. Sign-in/sign-out control, rendered
// once in AppHeader.js so it's visible on every page.
import { useAuth } from '../../hooks/useAuth'
import Button from '../Button'
import styles from '../../styles/AppHeader.module.css'

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth()

  if (loading) {
    return null
  }

  if (!user) {
    return <Button onClick={signInWithGoogle}>Sign in with Google</Button>
  }

  return (
    <div className={styles.signedIn}>
      <span className={styles.email}>{user.email}</span>
      <Button onClick={signOut}>Sign out</Button>
    </div>
  )
}
