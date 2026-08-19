// These cases were originally verified by hand with throwaway node
// scripts while building timezone support (see the session history) —
// turned into real tests here instead of one-off scratch files, so a
// future change can't silently regress the DST handling, which is the
// one part of this file that's genuinely easy to get subtly wrong.
import {
  zonedTimeToUtc,
  utcToZonedDateTimeLocal,
  isSameZonedDay,
  formatZonedDate,
  formatZonedTime,
  formatZonedDateTime,
  zonedDayKey,
  startOfZonedDay,
  addZonedDays,
} from '../timezone'

describe('zonedTimeToUtc', () => {
  it('converts a New York wall-clock time to UTC in winter (EST, UTC-5)', () => {
    const result = zonedTimeToUtc('2026-01-15T10:00', 'America/New_York')
    expect(result.toISOString()).toBe('2026-01-15T15:00:00.000Z')
  })

  it('converts a New York wall-clock time to UTC in summer (EDT, UTC-4)', () => {
    const result = zonedTimeToUtc('2026-08-15T10:00', 'America/New_York')
    expect(result.toISOString()).toBe('2026-08-15T14:00:00.000Z')
  })

  it('converts a Los Angeles wall-clock time to UTC (PDT, UTC-7 in August)', () => {
    const result = zonedTimeToUtc('2026-08-15T10:00', 'America/Los_Angeles')
    expect(result.toISOString()).toBe('2026-08-15T17:00:00.000Z')
  })

  it('returns null for an empty input', () => {
    expect(zonedTimeToUtc('', 'America/New_York')).toBeNull()
  })
})

describe('utcToZonedDateTimeLocal', () => {
  it('round-trips with zonedTimeToUtc', () => {
    const original = '2026-08-15T10:00'
    const utc = zonedTimeToUtc(original, 'America/New_York')
    const back = utcToZonedDateTimeLocal(utc.toISOString(), 'America/New_York')
    expect(back).toBe(original)
  })

  it('returns an empty string for a falsy input', () => {
    expect(utcToZonedDateTimeLocal('', 'America/New_York')).toBe('')
  })
})

describe('isSameZonedDay', () => {
  it('treats an evening UTC instant as the PREVIOUS calendar day west of UTC', () => {
    // 2026-08-19T01:00:00Z is still 2026-08-18 evening in New York (EDT, UTC-4).
    const eveningUtc = '2026-08-19T01:00:00Z'
    const sameDayNY = '2026-08-18T20:00:00Z' // 4pm EDT on Aug 18
    expect(isSameZonedDay(eveningUtc, sameDayNY, 'America/New_York')).toBe(true)
  })

  it('returns false for two instants on different zoned days', () => {
    expect(
      isSameZonedDay('2026-08-18T12:00:00Z', '2026-08-19T12:00:00Z', 'America/New_York')
    ).toBe(false)
  })

  it('returns false when either input is missing', () => {
    expect(isSameZonedDay(null, '2026-08-18T12:00:00Z', 'UTC')).toBe(false)
    expect(isSameZonedDay('2026-08-18T12:00:00Z', null, 'UTC')).toBe(false)
  })
})

describe('zonedDayKey', () => {
  it('formats as YYYY-MM-DD in the given timezone', () => {
    expect(zonedDayKey('2026-08-19T01:00:00Z', 'America/New_York')).toBe('2026-08-18')
    expect(zonedDayKey('2026-08-19T01:00:00Z', 'UTC')).toBe('2026-08-19')
  })
})

describe('startOfZonedDay', () => {
  it('returns that day\'s local midnight, as a UTC instant', () => {
    const result = startOfZonedDay('2026-08-19T15:00:00Z', 'America/New_York')
    // Midnight Aug 19 in New York (EDT, UTC-4) is 04:00 UTC.
    expect(result.toISOString()).toBe('2026-08-19T04:00:00.000Z')
  })
})

describe('addZonedDays', () => {
  it('adds days within the same month', () => {
    const start = startOfZonedDay('2026-08-19T15:00:00Z', 'America/New_York')
    const result = addZonedDays(start, 1, 'America/New_York')
    expect(zonedDayKey(result, 'America/New_York')).toBe('2026-08-20')
  })

  it('subtracts days across a month boundary', () => {
    const start = startOfZonedDay('2026-09-01T15:00:00Z', 'America/New_York')
    const result = addZonedDays(start, -1, 'America/New_York')
    expect(zonedDayKey(result, 'America/New_York')).toBe('2026-08-31')
  })

  it('rolls over a year boundary', () => {
    const start = startOfZonedDay('2026-01-01T15:00:00Z', 'America/New_York')
    const result = addZonedDays(start, -1, 'America/New_York')
    expect(zonedDayKey(result, 'America/New_York')).toBe('2025-12-31')
  })
})

describe('formatZonedDate / formatZonedTime', () => {
  it('formats a date in the given timezone', () => {
    expect(formatZonedDate('2026-08-19T15:00:00Z', 'UTC')).toBe('August 19, 2026')
  })

  it('formats a time in the given timezone', () => {
    // 15:00 UTC is 11:00 AM in New York (EDT, UTC-4).
    expect(formatZonedTime('2026-08-19T15:00:00Z', 'America/New_York')).toBe('11:00 AM')
  })
})

describe('formatZonedDateTime', () => {
  it('combines the date and time output, in the given timezone', () => {
    expect(formatZonedDateTime('2026-08-19T15:00:00Z', 'UTC')).toBe('August 19, 2026 at 3:00 PM')
  })

  it('is timezone-aware, not just a UTC passthrough', () => {
    // 15:00 UTC is 11:00 AM in New York (EDT, UTC-4) — same calendar day.
    expect(formatZonedDateTime('2026-08-19T15:00:00Z', 'America/New_York')).toBe(
      'August 19, 2026 at 11:00 AM'
    )
  })
})
