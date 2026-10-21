// Copy of whitehill-lifecare/sanity/lib/claim-check.ts. Keep the two in sync.
// Words that read as cure or treatment claims (AGENTS.md §10.1). "heal" is
// matched as a whole word so "health" passes.
const claimPattern =
  /\b(treat(s|ed|ing|ment|ments)?|cur(e|es|ed|ing)|prevent\w*|heal(s|ed|ing)?|fight\w*|guarantee\w*|relie(f|ve|ves|ved|ving)|management of)\b/i

/** Returns the first claim word found, or null. */
export function findClaimWord(value: unknown): string | null {
  if (typeof value !== "string") return null
  return value.match(claimPattern)?.[0] ?? null
}

export function claimMessage(word: string) {
  return `"${word}" reads as a cure or treatment claim. Use "supports" / "helps support" wording.`
}

/** For use in `Rule.custom()`: passes, or returns the warning text. */
export function claimCheck(value: unknown): true | string {
  const word = findClaimWord(value)
  return word ? claimMessage(word) : true
}
