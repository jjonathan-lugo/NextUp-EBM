import { createTask } from '../Task'

describe('createTask', () => {
  it('fills in every field passed explicitly', () => {
    const task = createTask({
      id: 't1',
      title: 'Write summary',
      description: 'For the team meeting',
      effort: 3,
      priority: 4,
      weight: 7,
      dueDate: '2026-08-20T12:00:00Z',
      recommendedStart: '2026-08-19T09:00:00Z',
      status: 'in_progress',
      timeSpentSeconds: 120,
      createdAt: '2026-08-18T00:00:00Z',
      updatedAt: '2026-08-19T00:00:00Z',
    })

    expect(task).toEqual({
      id: 't1',
      title: 'Write summary',
      description: 'For the team meeting',
      effort: 3,
      priority: 4,
      weight: 7,
      dueDate: '2026-08-20T12:00:00Z',
      recommendedStart: '2026-08-19T09:00:00Z',
      status: 'in_progress',
      timeSpentSeconds: 120,
      createdAt: '2026-08-18T00:00:00Z',
      updatedAt: '2026-08-19T00:00:00Z',
    })
  })

  it('applies defaults for every optional field when only id and title are given', () => {
    const task = createTask({ id: 't2', title: 'Minimal task' })

    expect(task.description).toBe('')
    expect(task.effort).toBe(1)
    expect(task.priority).toBe(1)
    expect(task.weight).toBe(0)
    expect(task.dueDate).toBeNull()
    expect(task.recommendedStart).toBeNull()
    expect(task.status).toBe('todo')
    expect(task.timeSpentSeconds).toBe(0)
    expect(typeof task.createdAt).toBe('string')
    expect(typeof task.updatedAt).toBe('string')
    // Defaults should be valid, parseable ISO timestamps.
    expect(Number.isNaN(Date.parse(task.createdAt))).toBe(false)
    expect(Number.isNaN(Date.parse(task.updatedAt))).toBe(false)
  })

  it('preserves id and title exactly (no defaulting/mutation)', () => {
    const task = createTask({ id: 'abc-123', title: 'Exact title' })
    expect(task.id).toBe('abc-123')
    expect(task.title).toBe('Exact title')
  })
})
