#!/usr/bin/env node
// Fails if the refund-policy page still has bracket placeholders, or if a
// filled grievance [email] does not match the address in "How to ask" / "Contact".
// Not wired into `build` — run with `npm run check:placeholders`.
import fs from 'node:fs'
import path from 'node:path'

const DEFAULT = path.join(process.cwd(), 'src/app/refund-policy/page.tsx')
const file = path.resolve(process.argv[2] || DEFAULT)

if (!fs.existsSync(file)) {
  console.error(`check-placeholders: file not found: ${file}`)
  process.exit(1)
}

const src = fs.readFileSync(file, 'utf8')
const errors = []

const placeholders = [
  ['[address]', /\[address\]/],
  ['[email]', /\[email\]/],
  ['[phone]', /\[phone\]/],
  ['[7]', /\[7\]/],
  ['[effective date — set on publish]', /\[effective date/],
]

for (const [label, re] of placeholders) {
  if (re.test(src)) errors.push(`placeholder still present: ${label}`)
}

// Emails in the page source (skip the mailto: query string, CSS, etc.)
const emails = [...src.matchAll(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi)].map((m) => m[0].toLowerCase())
const uniqueEmails = [...new Set(emails)]
const stillHasEmailPlaceholder = /\[email\]/.test(src)

if (!stillHasEmailPlaceholder && uniqueEmails.length > 1) {
  errors.push(
    `Gmail-vs-[email] mismatch: How to ask / Contact / Who we are use more than one address (${uniqueEmails.join(', ')}). When [email] is filled, use the same address in all three.`
  )
}

if (errors.length) {
  console.error(`check-placeholders: ${path.relative(process.cwd(), file)}`)
  for (const e of errors) console.error(`  - ${e}`)
  process.exit(1)
}

console.log(`check-placeholders: ${path.relative(process.cwd(), file)} is clear`)
