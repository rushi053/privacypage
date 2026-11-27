// Exercises src/lib/license-request.ts directly (no .mjs port).
// Run: node --experimental-strip-types --test scripts/check-license-request.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { LICENSE_KEY_MAX_CHARS as SHARED_LICENSE_KEY_MAX_CHARS } from '../src/lib/document-id.ts'
import {
  EMAIL_MAX_CHARS,
  LICENSE_KEY_MAX_CHARS,
  parseLicenseRequest,
  readLicenseRequest,
} from '../src/lib/license-request.ts'

const root = path.join(import.meta.dirname, '..')
const VALID_KEY = 'PP-A1B2C3D4'

function lookupOf(result) {
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.body))
  if (!result.ok) throw new Error('unreachable')
  return result.lookup
}

function errorOf(result) {
  assert.equal(result.ok, false)
  if (result.ok) throw new Error('unreachable')
  assert.equal(result.status, 400)
  assert.equal(typeof result.body.error, 'string')
  assert.ok(result.body.error.length > 0)
  return result
}

test('caps match the shared license-key limit and the email path limit', () => {
  assert.equal(SHARED_LICENSE_KEY_MAX_CHARS, 64)
  assert.equal(LICENSE_KEY_MAX_CHARS, SHARED_LICENSE_KEY_MAX_CHARS)
  assert.equal(EMAIL_MAX_CHARS, 254)
})

test('malformed JSON is 400, not a thrown verification failure', () => {
  for (const raw of ['', '   ', '{', '{]', 'undefined', '[,]', '{"a":}', 'PP-A1B2C3D4']) {
    const result = errorOf(parseLicenseRequest(raw))
    assert.equal(result.body.error, 'Request body is not valid JSON.', raw)
  }
})

test('null, array, string, number, and boolean bodies are 400', () => {
  for (const raw of ['null', '[]', '[1,2]', '"hello"', '1', 'true', 'false']) {
    const result = errorOf(parseLicenseRequest(raw))
    assert.equal(result.body.error, 'Request body must be a JSON object.', raw)
  }
})

test('non-string licenseKey and email are 400 and are not coerced', () => {
  const cases = [
    [{ licenseKey: 12345 }, 'licenseKey must be a string.'],
    [{ licenseKey: 0 }, 'licenseKey must be a string.'],
    [{ licenseKey: { a: 1 } }, 'licenseKey must be a string.'],
    [{ licenseKey: ['PP-A1B2C3D4'] }, 'licenseKey must be a string.'],
    [{ licenseKey: true }, 'licenseKey must be a string.'],
    [{ licenseKey: false }, 'licenseKey must be a string.'],
    [{ licenseKey: null }, 'licenseKey must be a string.'],
    [{ email: 1 }, 'email must be a string.'],
    [{ email: ['a@b.com'] }, 'email must be a string.'],
    [{ email: { to: 'a@b.com' } }, 'email must be a string.'],
    [{ email: true }, 'email must be a string.'],
    [{ email: null }, 'email must be a string.'],
    // A valid sibling must not bypass a non-string field.
    [{ licenseKey: 12345, email: 'buyer@example.com' }, 'licenseKey must be a string.'],
    [{ licenseKey: VALID_KEY, email: ['buyer@example.com'] }, 'email must be a string.'],
  ]
  for (const [body, message] of cases) {
    const result = errorOf(parseLicenseRequest(JSON.stringify(body)))
    assert.equal(result.body.error, message, JSON.stringify(body))
  }
})

test('empty and whitespace-only fields count as missing', () => {
  for (const raw of [
    '{}',
    JSON.stringify({ licenseKey: '' }),
    JSON.stringify({ email: '' }),
    JSON.stringify({ licenseKey: '   ', email: '\n\t' }),
    JSON.stringify({ licenseKey: ' '.repeat(80) }),
    JSON.stringify({ email: ' '.repeat(300) }),
  ]) {
    const result = errorOf(parseLicenseRequest(raw))
    assert.equal(result.body.error, 'License key or email required', raw)
  }
})

test('oversize licenseKey and email are 400', () => {
  const longKey = errorOf(parseLicenseRequest(JSON.stringify({ licenseKey: 'P'.repeat(65) })))
  assert.equal(longKey.body.error, 'licenseKey must be at most 64 characters.')

  const paddedKey = ' '.repeat(10) + 'K'.repeat(65) + ' '.repeat(10)
  const trimmedKey = errorOf(parseLicenseRequest(JSON.stringify({ licenseKey: paddedKey })))
  assert.equal(trimmedKey.body.error, 'licenseKey must be at most 64 characters.')

  // 64 characters is within the cap, so a non-key of that length fails format.
  const atCap = errorOf(parseLicenseRequest(JSON.stringify({ licenseKey: 'K'.repeat(64) })))
  assert.equal(atCap.body.error, 'License key must be in the form PP-XXXXXXXX.')

  const longEmail = errorOf(parseLicenseRequest(JSON.stringify({ email: 'e'.repeat(255) })))
  assert.equal(longEmail.body.error, 'email must be at most 254 characters.')

  const exactEmail = lookupOf(parseLicenseRequest(JSON.stringify({ email: 'e'.repeat(254) })))
  assert.deepEqual(exactEmail, { by: 'email', email: 'e'.repeat(254) })

  const paddedEmail = lookupOf(parseLicenseRequest(JSON.stringify({
    email: ` ${'e'.repeat(254)} `,
  })))
  assert.deepEqual(paddedEmail, { by: 'email', email: 'e'.repeat(254) })
})

test('bad license key formats are 400 and do not fall through to email', () => {
  const bad = [
    'not-a-key',
    'PP-XXXXXXXX',
    'PP-A1B2C3D',
    'PP-A1B2C3D4E',
    'PP-a1b2c3d4',
    'pp-A1B2C3D4',
    'PP- A1B2C3D4',
    'PP-A1B2C3D4&select=*',
    'PP-A1B2C3D4\u0000',
  ]
  for (const licenseKey of bad) {
    const alone = errorOf(parseLicenseRequest(JSON.stringify({ licenseKey })))
    assert.equal(alone.body.error, 'License key must be in the form PP-XXXXXXXX.', licenseKey)
    const withEmail = errorOf(parseLicenseRequest(JSON.stringify({
      licenseKey,
      email: 'buyer@example.com',
    })))
    assert.equal(withEmail.body.error, 'License key must be in the form PP-XXXXXXXX.', licenseKey)
  }
})

test('a valid key is trimmed and preferred over email', () => {
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({ licenseKey: VALID_KEY }))),
    { by: 'licenseKey', licenseKey: VALID_KEY }
  )
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({ licenseKey: `  ${VALID_KEY}\n` }))),
    { by: 'licenseKey', licenseKey: VALID_KEY }
  )
  for (const licenseKey of ['PP-00000000', 'PP-FFFFFFFF', 'PP-01234567']) {
    assert.deepEqual(
      lookupOf(parseLicenseRequest(JSON.stringify({ licenseKey }))),
      { by: 'licenseKey', licenseKey }
    )
  }
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({
      licenseKey: VALID_KEY,
      email: 'Buyer@Example.com',
    }))),
    { by: 'licenseKey', licenseKey: VALID_KEY }
  )
})

test('a valid email is trimmed only and is not lowercased', () => {
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({ email: 'Buyer@Example.com' }))),
    { by: 'email', email: 'Buyer@Example.com' }
  )
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({ email: '  User+Tag@Example.COM  ' }))),
    { by: 'email', email: 'User+Tag@Example.COM' }
  )
  // A blank key counts as missing, so the email is what gets looked up.
  assert.deepEqual(
    lookupOf(parseLicenseRequest(JSON.stringify({
      licenseKey: '   ',
      email: 'Buyer@Example.com',
    }))),
    { by: 'email', email: 'Buyer@Example.com' }
  )
})

test('readLicenseRequest parses a Request and rejects an unreadable body', async () => {
  const req = new Request('http://127.0.0.1/api/license/verify', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'Buyer@Example.com' }),
  })
  assert.deepEqual(lookupOf(await readLicenseRequest(req)), {
    by: 'email',
    email: 'Buyer@Example.com',
  })

  const unreadable = errorOf(await readLicenseRequest({
    text: async () => {
      throw new Error('boom')
    },
  }))
  assert.equal(unreadable.body.error, 'Request body is not valid JSON.')
})

test('verify route rate-limits, then validates, and keeps the lookup responses', () => {
  const src = fs.readFileSync(path.join(root, 'src/app/api/license/verify/route.ts'), 'utf8')
  assert.equal(src.includes('req.json('), false)
  assert.equal(src.includes('.toLowerCase('), false)

  const rate = src.indexOf('await checkLicenseVerifyRateLimit(getClientIp(')
  const parse = src.indexOf('await readLicenseRequest(')
  const select = src.indexOf('await sbSelect')
  assert.ok(rate !== -1 && parse !== -1 && select !== -1)
  assert.ok(rate < parse && parse < select)

  assert.match(src, /error: "rate_limited", message: "Too many license lookups\. Please try again in a minute\."/)
  assert.match(src, /status: 429/)
  assert.match(src, /license_key=eq\.\$\{encodeURIComponent\(parsed\.lookup\.licenseKey\)\}/)
  assert.match(src, /email=eq\.\$\{encodeURIComponent\(parsed\.lookup\.email\)\}&order=created_at\.desc/)
  assert.match(src, /return NextResponse\.json\(\{ found: false, error: "No purchase found" \}, \{ status: 404 \}\)/)
  assert.match(src, /return NextResponse\.json\(\{ found: true, purchases: docTypes \}\)/)
  assert.match(src, /error: "Verification failed"/)

  const limiter = fs.readFileSync(path.join(root, 'src/lib/rate-limit.ts'), 'utf8')
  assert.match(limiter, /const MAX_REQUESTS_PER_HOUR = 10/)
  assert.match(limiter, /Date\.now\(\) - 60 \* 60 \* 1000/)
  assert.match(limiter, /export const LICENSE_VERIFY_MAX_PER_MINUTE = 10/)
  assert.match(limiter, /license-verify:\$\{ip\}/)
  const generation = limiter.indexOf('export async function checkRateLimit')
  const verify = limiter.indexOf('export async function checkLicenseVerifyRateLimit')
  assert.ok(generation !== -1 && verify !== -1 && generation < verify)
})
