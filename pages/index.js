// Shared — coordinate before editing.
// TODO: this is still the Next.js starter demo content. Per the handoff
// doc this is meant to become the real homepage, likely composing all 3
// features — including a spot for the Focus Queue
// (components/shared/FocusQueue.js), which doesn't have an assigned
// owner or page yet.

import { useCallback, useEffect, useState } from 'react'
import Button from '../components/Button'
import ClickCount from '../components/ClickCount'
import styles from '../styles/home.module.css'
import Timer from '../components/focus-weighting/FocusTimer'
import ProductivityFeed from '../components/smart-start-feed/ProductivityTipsFeed'

function throwError() {
  console.log(
    document.body()
  )
}

function Home() {
  const [count, setCount] = useState(0)

  const increment = useCallback(() => {
    setCount((v) => v + 1)
  }, [setCount])

  useEffect(() => {
    const r = setInterval(() => {
      increment()
    }, 1000)

    return () => {
      clearInterval(r)
    }
  }, [increment])

  return (
    <main className={styles.main}>
      <Timer />

      <ProductivityFeed />

      <hr className={styles.hr} />

      <h1>Fast Refresh Demo</h1>

      <p>
        Fast Refresh is a Next.js feature that gives you instantaneous feedback
        on edits made to your React components, without ever losing component
        state.
      </p>

      <hr className={styles.hr} />

      <div>
        <p>
          Auto incrementing value. The counter won't reset after edits or if
          there are errors.
        </p>

        <Button onClick={increment}>Increment</Button>

        <ClickCount count={count} />

        <button onClick={throwError}>Throw Error</button>
      </div>
    </main>
  )
}

export default Home