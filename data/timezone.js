// Timezone conversion utilities — vanilla JS, no library. Uses the
// standard "double format" trick with Intl.DateTimeFormat to compute an
// IANA timezone's offset at a specific instant, which correctly handles
// DST since the offset is computed per-date rather than assumed fixed.

function getZonedParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const parts = formatter.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value
    return acc
  }, {})

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  }
}

// Converts a "wall clock" datetime-local string (e.g. "2026-08-25T14:30",
// no timezone info) — interpreted as being in `timeZone` — into a real
// UTC Date instant.
export function zonedTimeToUtc(dateTimeLocalString, timeZone) {
  if (!dateTimeLocalString) return null

  // Treat the typed numbers as if they were UTC, as a starting guess.
  const guessUtc = new Date(`${dateTimeLocalString}:00.000Z`)
  // See what that guess looks like when read back in the target timezone.
  const zonedParts = getZonedParts(guessUtc, timeZone)
  const zonedAsUtc = Date.UTC(
    zonedParts.year,
    zonedParts.month - 1,
    zonedParts.day,
    zonedParts.hour,
    zonedParts.minute,
    zonedParts.second
  )
  // The gap between the guess and how it reads back in that timezone is
  // exactly the timezone's offset at that instant.
  const offsetMs = zonedAsUtc - guessUtc.getTime()
  return new Date(guessUtc.getTime() - offsetMs)
}

// Converts a UTC ISO string into a "YYYY-MM-DDTHH:mm" string suitable
// for an <input type="datetime-local"> value, as seen in `timeZone`.
export function utcToZonedDateTimeLocal(isoString, timeZone) {
  if (!isoString) return ''
  const parts = getZonedParts(new Date(isoString), timeZone)
  const pad = (n) => String(n).padStart(2, '0')
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`
}

// Whether two ISO instants fall on the same calendar day in `timeZone`.
export function isSameZonedDay(isoStringA, isoStringB, timeZone) {
  if (!isoStringA || !isoStringB) return false
  const a = getZonedParts(new Date(isoStringA), timeZone)
  const b = getZonedParts(new Date(isoStringB), timeZone)
  return a.year === b.year && a.month === b.month && a.day === b.day
}

// Human date, no time (e.g. "August 23, 2026"), in `timeZone`.
export function formatZonedDate(isoString, timeZone) {
  return new Date(isoString).toLocaleDateString(undefined, {
    timeZone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Human time (e.g. "2:30 PM"), in `timeZone`.
export function formatZonedTime(isoString, timeZone) {
  return new Date(isoString).toLocaleTimeString(undefined, {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
  })
}

// "YYYY-MM-DD" for `date`'s calendar day in `timeZone` — a day-bucketing
// key that's actually consistent with that timezone, unlike using UTC
// date components (which puts evening-UTC instants on the "wrong" local
// day for anyone west of UTC).
export function zonedDayKey(date, timeZone) {
  const parts = getZonedParts(new Date(date), timeZone)
  const pad = (n) => String(n).padStart(2, '0')
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`
}

// The UTC instant representing local midnight of `date`'s calendar day
// in `timeZone` — the timezone-correct equivalent of zeroing to UTC
// midnight.
export function startOfZonedDay(date, timeZone) {
  return zonedTimeToUtc(`${zonedDayKey(date, timeZone)}T00:00`, timeZone)
}

// `date`'s calendar day in `timeZone`, shifted by `deltaDays` (may be
// negative), returned as that new day's zoned midnight (UTC instant).
// Uses Date.UTC purely for calendar rollover math (month/year boundaries),
// not as a real instant — the Y/M/D numbers are then reinterpreted as a
// wall-clock day in the target timezone.
export function addZonedDays(date, deltaDays, timeZone) {
  const parts = getZonedParts(new Date(date), timeZone)
  const rolled = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + deltaDays))
  const pad = (n) => String(n).padStart(2, '0')
  const rolledKey = `${rolled.getUTCFullYear()}-${pad(rolled.getUTCMonth() + 1)}-${pad(rolled.getUTCDate())}`
  return zonedTimeToUtc(`${rolledKey}T00:00`, timeZone)
}
