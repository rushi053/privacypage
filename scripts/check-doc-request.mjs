// Exercises src/lib/parse-doc-request.ts directly (no .mjs port).
// Run: node --experimental-strip-types --test scripts/check-doc-request.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { Buffer } from 'node:buffer'
import { buildDocPrompt } from '../src/lib/generate-content.ts'
import {
  DOC_REQUEST_MAX_BYTES,
  DOC_REQUEST_MAX_FIELD_CHARS,
  parseDocRequest,
  readDocRequest,
} from '../src/lib/parse-doc-request.ts'
import { wizardConfigs } from '../src/lib/wizardConfigs.ts'

const root = path.join(import.meta.dirname, '..')

function dataOf(result) {
  assert.equal(result.ok, true, result.ok ? '' : JSON.stringify(result.body))
  if (!result.ok) throw new Error('unreachable')
  return result.data
}

function errorOf(result) {
  assert.equal(result.ok, false)
  if (result.ok) throw new Error('unreachable')
  return result
}

test('limits are 32 KiB and 2000 characters', () => {
  assert.equal(DOC_REQUEST_MAX_BYTES, 32 * 1024)
  assert.equal(DOC_REQUEST_MAX_FIELD_CHARS, 2000)
})

test('wizard payloads pass unchanged and prompts stay byte-identical', () => {
  let longest = 0
  let longestLabel = ''
  for (const config of Object.values(wizardConfigs)) {
    const payload = { docType: config.type }
    for (const step of config.steps) {
      if (step.type === 'multiselect') payload[step.id] = step.options.join(', ')
      else if (step.type === 'select') payload[step.id] = step.options[0]
      else payload[step.id] = step.placeholder.replace(/^e\.g\.\s*/, '')
      if (payload[step.id].length > longest) {
        longest = payload[step.id].length
        longestLabel = `${config.type}.${step.id}`
      }
    }
    const raw = JSON.stringify(payload)
    const parsed = parseDocRequest(raw)
    const data = dataOf(parsed)
    assert.deepEqual(data, payload)
    assert.equal(JSON.stringify(data), raw)
    assert.equal(buildDocPrompt(config.type, data), buildDocPrompt(config.type, payload))
  }
  // Longest joined option list today is far under the cap. No textarea exists.
  assert.ok(longest < 300, `${longestLabel} is ${longest} characters`)
  assert.ok(longest <= DOC_REQUEST_MAX_FIELD_CHARS)
})

test('license-key body used by regenerate passes unchanged', () => {
  const payload = { licenseKey: 'PP-A1B2C3D4' }
  const raw = JSON.stringify(payload)
  const data = dataOf(parseDocRequest(raw))
  assert.deepEqual(data, payload)
  assert.equal(JSON.stringify(data), raw)
})

test('malformed and empty JSON are invalid_json', () => {
  for (const raw of ['', '   ', '{', '{]', 'undefined', '[,]', '{"a":}']) {
    const result = errorOf(parseDocRequest(raw))
    assert.equal(result.status, 400)
    assert.equal(result.body.error, 'invalid_json')
    assert.equal(typeof result.body.message, 'string')
    assert.ok(result.body.message.length > 0)
  }
})

test('array, null, string, and number bodies are invalid_body', () => {
  for (const raw of ['[]', '[1,2]', 'null', '"hello"', '1', 'true']) {
    const result = errorOf(parseDocRequest(raw))
    assert.equal(result.status, 400, raw)
    assert.equal(result.body.error, 'invalid_body', raw)
  }
})

test('nested objects and arrays are rejected, not dropped', () => {
  for (const raw of ['{"appName":"MyApp","extra":{"a":1}}', '{"tags":["a","b"]}', '{"n":null}']) {
    const result = errorOf(parseDocRequest(raw))
    assert.equal(result.status, 400)
    assert.equal(result.body.error, 'invalid_body')
    assert.match(result.body.message, /Nested objects and arrays|null|must be a JSON object|must be a string/)
  }
})

test('reserved keys are rejected', () => {
  const result = errorOf(parseDocRequest('{"__proto__":{"admin":true},"appName":"MyApp"}'))
  assert.equal(result.body.error, 'invalid_body')
  assert.equal(Object.prototype.admin, undefined)
})

test('oversize body is 413 from the raw text and from Content-Length', () => {
  const core = '{"appName":"MyApp"}'
  const exact = core + ' '.repeat(DOC_REQUEST_MAX_BYTES - Buffer.byteLength(core))
  assert.equal(Buffer.byteLength(exact), DOC_REQUEST_MAX_BYTES)
  assert.equal(dataOf(parseDocRequest(exact)).appName, 'MyApp')

  const over = exact + ' '
  const tooBig = errorOf(parseDocRequest(over))
  assert.equal(tooBig.status, 413)
  assert.equal(tooBig.body.error, 'payload_too_large')

  const header = errorOf(parseDocRequest('{"appName":"MyApp"}', String(DOC_REQUEST_MAX_BYTES + 1)))
  assert.equal(header.status, 413)
  assert.equal(header.body.error, 'payload_too_large')

  const atLimit = parseDocRequest('{"appName":"MyApp"}', String(DOC_REQUEST_MAX_BYTES))
  assert.equal(atLimit.ok, true)

  // Multibyte characters count as UTF-8 bytes, not UTF-16 code units.
  const euros = `{"a":"${'€'.repeat(12000)}"}`
  assert.ok(euros.length < DOC_REQUEST_MAX_BYTES)
  assert.ok(Buffer.byteLength(euros) > DOC_REQUEST_MAX_BYTES)
  assert.equal(errorOf(parseDocRequest(euros)).body.error, 'payload_too_large')
})

test('readDocRequest does not read the body when Content-Length is over the limit', async () => {
  let read = false
  const result = errorOf(await readDocRequest({
    headers: { get: (name) => (name.toLowerCase() === 'content-length' ? '99999' : null) },
    text: async () => {
      read = true
      return '{"appName":"MyApp"}'
    },
  }))
  assert.equal(read, false)
  assert.equal(result.status, 413)
  assert.equal(result.body.error, 'payload_too_large')
})

test('readDocRequest parses a real Request body', async () => {
  const payload = { appName: 'MyApp', docType: 'privacy', platform: 'iOS' }
  const req = new Request('http://127.0.0.1/api/generate', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = dataOf(await readDocRequest(req))
  assert.deepEqual(data, payload)
  assert.equal(buildDocPrompt('privacy', data), buildDocPrompt('privacy', payload))
})

test('unreadable body is invalid_json', async () => {
  const result = errorOf(await readDocRequest({
    headers: { get: () => null },
    text: async () => {
      throw new Error('boom')
    },
  }))
  assert.equal(result.status, 400)
  assert.equal(result.body.error, 'invalid_json')
})

test('oversize field is 400 and the cap is applied after trim', () => {
  const over = errorOf(parseDocRequest(JSON.stringify({ appName: 'x'.repeat(DOC_REQUEST_MAX_FIELD_CHARS + 1) })))
  assert.equal(over.status, 400)
  assert.equal(over.body.error, 'field_too_long')
  assert.match(over.body.message, /appName/)

  const exact = dataOf(parseDocRequest(JSON.stringify({ appName: 'y'.repeat(DOC_REQUEST_MAX_FIELD_CHARS) })))
  assert.equal(exact.appName.length, DOC_REQUEST_MAX_FIELD_CHARS)

  const padded = ' '.repeat(10) + 'z'.repeat(DOC_REQUEST_MAX_FIELD_CHARS) + ' '.repeat(10)
  const trimmed = dataOf(parseDocRequest(JSON.stringify({ appName: padded })))
  assert.equal(trimmed.appName, 'z'.repeat(DOC_REQUEST_MAX_FIELD_CHARS))

  // 2,000 characters, even when each is more than one byte.
  const accents = dataOf(parseDocRequest(JSON.stringify({ appName: 'é'.repeat(DOC_REQUEST_MAX_FIELD_CHARS) })))
  assert.equal(accents.appName.length, DOC_REQUEST_MAX_FIELD_CHARS)
})

test('numbers and booleans coerce to strings; already-trimmed strings stay put', () => {
  const raw = {
    appName: 'MyApp',
    companyInfo: 'Acme  Inc., privacy@acme.com',
    count: 3,
    zero: 0,
    flag: true,
    other: false,
  }
  const data = dataOf(parseDocRequest(JSON.stringify(raw)))
  assert.equal(data.appName, 'MyApp')
  assert.equal(data.companyInfo, 'Acme  Inc., privacy@acme.com')
  assert.equal(data.count, '3')
  assert.equal(data.zero, '0')
  assert.equal(data.flag, 'true')
  assert.equal(data.other, 'false')
  assert.equal(dataOf(parseDocRequest('{"appName":"","docType":"privacy"}')).appName, '')
  assert.equal(JSON.stringify(data), JSON.stringify({
    appName: 'MyApp',
    companyInfo: 'Acme  Inc., privacy@acme.com',
    count: '3',
    zero: '0',
    flag: 'true',
    other: 'false',
  }))
})

test('surrounding whitespace is trimmed and the prompt matches the trimmed value', () => {
  const padded = { appName: '  MyApp  ', docType: 'privacy', platform: 'iOS' }
  const trimmed = { appName: 'MyApp', docType: 'privacy', platform: 'iOS' }
  const data = dataOf(parseDocRequest(JSON.stringify(padded)))
  assert.deepEqual(data, trimmed)
  assert.equal(buildDocPrompt('privacy', data), buildDocPrompt('privacy', trimmed))
  assert.notEqual(buildDocPrompt('privacy', data), buildDocPrompt('privacy', padded))
})

test('generate routes parse after the rate limit and before generation', () => {
  const routes = [
    'src/app/api/generate/route.ts',
    'src/app/api/generate/cookie/route.ts',
    'src/app/api/generate/disclaimer/route.ts',
    'src/app/api/generate/eula/route.ts',
    'src/app/api/generate/tos/route.ts',
    'src/app/api/document/[id]/regenerate/route.ts',
  ]
  for (const rel of routes) {
    const src = fs.readFileSync(path.join(root, rel), 'utf8')
    assert.equal(src.includes('req.json('), false, rel)
    const rate = src.indexOf('await checkRateLimit(')
    const parse = src.indexOf('await readDocRequest(')
    const generate = src.indexOf('generateDocumentContent(')
    assert.ok(rate !== -1 && parse !== -1 && generate !== -1, rel)
    assert.ok(rate < parse && parse < generate, rel)
  }
  const regen = fs.readFileSync(path.join(root, 'src/app/api/document/[id]/regenerate/route.ts'), 'utf8')
  assert.match(regen, /parsed\.data\.licenseKey/)
  assert.match(regen, /generateDocumentContent\(doc\.doc_type, doc\.inputs/)
})
