import { toast } from "sonner"

import type { ActionResult } from "@/lib/action-result"

/** Shows the action's warning (e.g. the website couldn't be refreshed) after a successful save. */
export function showWarning<T>(result: ActionResult<T>) {
  if (result.ok && result.warning) toast.warning(result.warning, { duration: 8000 })
}
