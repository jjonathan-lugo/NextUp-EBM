// Shared — coordinate before editing. Thin layout chrome around
// AuthButton; kept separate so AuthButton stays pure auth logic/UI and
// this owns just the header bar placement, rendered once in _app.js.
//
// Added the "NextUp" brand mark here so the site's name is the one
// constant, biggest-weight element visible on every single page, not
// just something that happens to say "NextUp" on the homepage's <h1>.
// Centered in the header bar (see .header's grid in
// AppHeader.module.css) with the auth control pinned to the right in
// its own .authSlot, so the two don't compete for the same spot.
import Link from 'next/link'
import AuthButton from './AuthButton'
import styles from '../../styles/AppHeader.module.css'

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        NextUp
      </Link>
      <div className={styles.authSlot}>
        <AuthButton />
      </div>
    </header>
  )
}
