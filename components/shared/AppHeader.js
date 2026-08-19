// Shared — coordinate before editing. Thin layout chrome around
// AuthButton; kept separate so AuthButton stays pure auth logic/UI and
// this owns just the header bar placement, rendered once in _app.js.
import AuthButton from './AuthButton'
import styles from '../../styles/AppHeader.module.css'

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <AuthButton />
    </header>
  )
}
