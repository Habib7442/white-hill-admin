export type ActionResult<T = undefined> =
  /** `warning`: saved, but something after the save (e.g. refreshing the website) failed. */
  | { ok: true; data: T; warning?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> }

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors }
}

export function ok<T>(data: T, warning?: string): ActionResult<T> {
  return warning ? { ok: true, data, warning } : { ok: true, data }
}
