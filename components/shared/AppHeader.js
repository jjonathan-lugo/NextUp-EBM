// Shared — coordinate before editing. Thin layout chrome around
// AuthButton; kept separate so AuthButton stays pure auth logic/UI and
// this owns just the header bar placement, rendered once in _app.js.
//
// Added the "NextUp" brand mark here so the site's name is the one
// constant, biggest-weight element visible on every single page, not
// just something that happens to say "NextUp" on the homepage's <h1>.
// Left-aligned against the right-aligned auth control instead of both
// sharing one flex-end cluster, so the top of every page reads as two
// distinct things instead of one centered blob.
import Link from 'next/link'
import AuthButton from './AuthButton'
import styles from '../../styles/AppHeader.module.css'

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.brand}>
        NextUp
      </Link>
      <AuthButton />
    </header>
  )
}
