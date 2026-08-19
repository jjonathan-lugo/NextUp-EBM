// Auto-detects the browser's IANA timezone via Intl. No manual override —
// a prior version had a dropdown of ~400 IANA zones for manually picking
// one, which was more UI than this needed given detection already works
// for the vast majority of cases. If a real override is ever needed
// (VPN/travel edge cases, or once accounts exist and a saved preference
// makes sense), reintroduce it deliberately rather than defaulting to it.
import { useEffect, useState } from 'react'

function detectTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

export function useTimezone() {
  // Defaults to UTC during SSR/first render (no window yet); corrected
  // on mount below, matching the flash-of-default pattern that's fine
  // for a low-stakes preference like this.
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    setTimezone(detectTimezone())
  }, [])

  return { timezone }
}
