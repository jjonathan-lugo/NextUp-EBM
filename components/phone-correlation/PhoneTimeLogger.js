// Owner: Malika
import { useState } from 'react'
import Button from '../Button'

export default function PhoneTimeLogger() {
  const [minutes, setMinutes] = useState(0)

  return (
    <section>
      <h2>Log Phone Time</h2>
      <input
        type="number"
        min="0"
        value={minutes}
        onChange={(e) => setMinutes(Number(e.target.value))}
      />
      <Button
        onClick={() => {
          // TODO(M): persist entry via /api/phone-time
        }}
      >
        Log
      </Button>
    </section>
  )
}
