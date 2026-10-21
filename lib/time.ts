const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 60 * 60 * 24 * 365],
  ["month", 60 * 60 * 24 * 30],
  ["day", 60 * 60 * 24],
  ["hour", 60 * 60],
  ["minute", 60],
]

/**
 * The request time, read once in a Server Component and passed down as
 * `now`, so the server and client render the same "… ago" labels.
 */
export function requestTime() {
  return Date.now()
}

/** Short "5 min", "17 h", "2 d" like the reference card footers. */
export function shortAgo(iso: string, now: number) {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 60) return `${seconds} sec`
  const short: Record<string, string> = { minute: "min", hour: "h", day: "d", month: "mo", year: "y" }
  for (const [unit, size] of units) {
    if (seconds >= size) return `${Math.floor(seconds / size)} ${short[unit]}`
  }
  return "now"
}

export function fullDate(iso: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso))
}
