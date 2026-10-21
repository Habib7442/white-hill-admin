// Usage: npm run hash-password -- "your-password"
// Prints a base64-encoded bcrypt hash for ADMIN_PASSWORD_HASH. Base64 because
// Next's env loader expands "$" in a raw bcrypt hash.
import bcrypt from "bcryptjs"

const password = process.argv[2]
if (!password || password.length < 10) {
  console.error('Pass a password of at least 10 characters: npm run hash-password -- "..."')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log(Buffer.from(hash).toString("base64"))
