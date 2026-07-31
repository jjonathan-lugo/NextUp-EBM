// Owner: Jonathan Lugo
import { useState } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  // TODO(J): start counting — increment `seconds` on an interval while
  // isRunning is true (e.g. setInterval in a useEffect keyed off isRunning).
  const start = () => {
    setIsRunning(true)
  }

  // TODO(J): pause the interval without resetting `seconds`
  const pause = () => {
    setIsRunning(false)
  }

  // TODO(J): stop the interval and reset `seconds` back to 0
  const reset = () => {
    setIsRunning(false)
    setSeconds(0)
  }

  return { seconds, isRunning, start, pause, reset }
}
