// Owner: Jonathan Lugo
import { useState } from 'react'
import { useWeightCalculator } from '../../hooks/useWeightCalculator'
import TaskWeightBar from './TaskWeightBar'
import Button from '../Button'

export default function WeightingForm() {
  // Doc spec: effort and priority are each scored 1-5.
  const [effort, setEffort] = useState(1)
  const [priority, setPriority] = useState(1)
  const { weight, calculate } = useWeightCalculator()

  return (
    <section>
      <h2>Task Weighting</h2>
      <label>
        Effort (1-5)
        <input
          type="number"
          min="1"
          max="5"
          value={effort}
          onChange={(e) => setEffort(Number(e.target.value))}
        />
      </label>
      <label>
        Priority (1-5)
        <input
          type="number"
          min="1"
          max="5"
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </label>
      <Button onClick={() => calculate({ effort, priority })}>
        Calculate Weight
      </Button>
      {/* TODO(J): max is a placeholder until the real weight formula (see
          data/models/Task.js) is decided — adjust to match its range. */}
      <TaskWeightBar weight={weight} max={10} />
    </section>
  )
}
