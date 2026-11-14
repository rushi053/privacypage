#!/usr/bin/env node
// Checks internal links against the routes that actually render.
// Fails if a href, markdown link, or link tuple points at a path with no page.
// No dependencies — Node's type stripper loads the slug lists, same as
// scripts/validate-sitemap.mjs. Runs from `npm run validate:links` and prebuild.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { registerHooks } from 'node:module'

const root = process.cwd()
const SITE_HOSTS = new Set(['privacypage.io', 'www.privacypage.io'])

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
    const base = path.join(root, 'src', specifier.slice(2))
    const file = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, path.join(base, 'index.ts')]
      .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    if (!file) throw new Error(`cannot resolve ${specifier}`)
    return nextResolve(pathToFileURL(file).href, context)
  },
})

// Next.js metadata routes that are not page.tsx or route.ts files.
const METADATA_ROUTES = {
  'robots.ts': '/robots.txt',
  'robots.js': '/robots.txt',
  'sitemap.ts': '/sitemap.xml',
  'sitemap.js': '/sitemap.xml',
  'manifest.ts': '/manifest.webmanifest',
  'manifest.js': '/manifest.webmanifest',
}

// Dynamic pages and the slug list each one actually renders.
// blog/[slug]        → blogPosts via getAllPosts() in src/app/blog/[slug]/page.tsx
// for/[builder]      → builderPages + platformPages in src/app/for/[builder]/page.tsx
// vs/[competitor]    → competitorPages in src/app/vs/[competitor]/page.tsx
// compliance/[regulation] → regulationPages in src/app/compliance/[regulation]/page.tsx
const DYNAMIC_SLUGS = {
  'blog/[slug]': (data) => data.blogSlugs,
  'for/[builder]': (data) => [...data.builderSlugs, ...data.platformSlugs],
  'vs/[competitor]': (data) => data.competitorSlugs,
  'compliance/[regulation]': (data) => data.regulationSlugs,
}

function stripDecorations(raw) {
  let out = ''
  for (let i = 0; i < raw.length; i++) {
    if (raw.startsWith('${', i)) {
      const end = raw.indexOf('}', i)
      if (end === -1) return out + raw.slice(i)
      out += raw.slice(i, end + 1)
      i = end
      continue
    }
    if (raw[i] === '?' || raw[i] === '#') break
    out += raw[i]
  }
  return out
}

function normalizePath(pathname) {
  let value = stripDecorations(pathname)
  if (!value.startsWith('/')) value = `/${value}`
  if (value.length > 1) value = value.replace(/\/+$/, '')
  return value || '/'
}

function isInterpolation(segment) {
  return /^\$\{[^}]+\}$/.test(segment)
}

function matchTemplate(raw, index) {
  let body = stripDecorations(raw)
  if (body.length > 1) body = body.replace(/\/+$/, '')
  const segments = body.split('/').filter(Boolean)
  if (!segments.length) return index.routes.has('/')
  for (const pattern of index.patterns) {
    if (pattern.length !== segments.length) continue
    const matches = pattern.every((part, i) => {
      const segment = segments[i]
      if (part.dynamic) return isInterpolation(segment)
      return segment === part.static
    })
    if (matches) return true
  }
  return false
}

// 'skip' is not a link we check (external, mailto, tel, hash-only, /api/*).
// 'ok' resolves. 'broken' is an internal path with no route or public file.
function classify(raw, index) {
  if (typeof raw !== 'string') return 'skip'
  const trimmed = raw.trim()
  if (!trimmed) return 'skip'
  const lower = trimmed.toLowerCase()
  if (lower.startsWith('mailto:') || lower.startsWith('tel:') || lower.startsWith('javascript:')) return 'skip'
  if (trimmed.startsWith('#')) return 'skip'
  if (trimmed.startsWith('//')) return 'skip'

  let pathname
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    let url
    try {
      url = new URL(trimmed)
    } catch {
      return 'broken'
    }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return 'skip'
    if (!SITE_HOSTS.has(url.hostname)) return 'skip'
    pathname = url.pathname
  } else if (!trimmed.startsWith('/')) {
    return 'skip'
  } else if (trimmed.includes('${')) {
    return matchTemplate(trimmed, index) ? 'ok' : 'broken'
  } else {
    pathname = trimmed
  }

  const route = normalizePath(pathname)
  if (route === '/api' || route.startsWith('/api/')) return 'skip'
  if (index.publicFiles.has(route)) return 'ok'
  if (index.routes.has(route)) return 'ok'
  return 'broken'
}

// href="/...", href={'/...'}, href={`/...`}, href: '/...', markdown ](/...),
// link tuples ['/...', 'Label'], and fix: '/...' passed through to href.
const LINK_PATTERNS = [
  { re: /\bhref['"]?\s*[:=]\s*\{?\s*(['"`])([^'"`\n]*)\1/dg, group: 2 },
  { re: /\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/dg, group: 1 },
  { re: /\[\s*(['"`])(\/[^'"`\n]*)\1\s*,/dg, group: 2 },
  { re: /\bfix\s*:\s*(['"`])(\/[^'"`\n]*)\1/dg, group: 2 },
]

function extractLinks(text) {
  const found = []
  const seen = new Set()
  for (const spec of LINK_PATTERNS) {
    spec.re.lastIndex = 0
    let match
    while ((match = spec.re.exec(text))) {
      const at = match.indices[spec.group][0]
      if (seen.has(at)) continue
      seen.add(at)
      found.push({ raw: match[spec.group], at })
    }
  }
  return found
}

function lineAt(text, index) {
  let line = 1
  for (let i = 0; i < index && i < text.length; i++) if (text.charCodeAt(i) === 10) line++
  return line
}

function normalisedOf(raw) {
  try {
    if (raw.includes('${')) {
      const body = stripDecorations(raw)
      return body.length > 1 ? body.replace(/\/+$/, '') : body || '/'
    }
    if (/^https?:\/\//i.test(raw)) return normalizePath(new URL(raw).pathname)
    return normalizePath(raw)
  } catch {
    return raw.trim()
  }
}

function selfTest() {
  const index = {
    routes: new Set(['/', '/pricing', '/blog/real-post', '/for/ios-app']),
    patterns: [[{ dynamic: false, static: 'blog' }, { dynamic: true }]],
    publicFiles: new Set(['/google.html']),
  }
  const failures = []
  const expect = (raw, want) => {
    const got = classify(raw, index)
    if (got !== want) failures.push(`${JSON.stringify(raw)} classified ${got}, expected ${want}`)
  }
  expect('/pricing/', 'ok')
  expect('/pricing?x=1#y', 'ok')
  expect('/#generate', 'ok')
  expect('#generate', 'skip')
  expect('/blog/real-post', 'ok')
  expect('/blog/nope', 'broken')
  expect('/blog/${post.slug}', 'ok')
  expect('/blog/${post.slug}/', 'ok')
  expect('/nope/${x}', 'broken')
  expect('/blogs/${post.slug}', 'broken')
  expect('/api/geo', 'skip')
  expect('/api/generate?x=1', 'skip')
  expect('mailto:a@b.c', 'skip')
  expect('tel:+1555', 'skip')
  expect('https://example.com/pricing', 'skip')
  expect('https://privacypage.io/pricing#x', 'ok')
  expect('https://privacypage.io/missing', 'broken')
  expect('https://www.privacypage.io/pricing/', 'ok')
  expect('http://privacypage.io', 'ok')
  expect('//cdn.example/pricing', 'skip')
  expect('/google.html', 'ok')
  expect('/missing.html', 'broken')
  expect('/', 'ok')

  const sample = [
    '<a href="/definitely-not-a-route">x</a>',
    "href={'/also-missing'}",
    'href={"/quoted"}',
    'href={`/blog/${post.slug}`}',
    '[guide](/missing-md)',
    "['/pricing', 'Pricing']",
    "fix: '/for/ios-app'",
    'href="mailto:a@b.c"',
    'href="/api/geo"',
    'href="https://example.com/x"',
    'href="/#generate"',
    '[home](https://privacypage.io/pricing)',
    '"href": "/blog/nope"',
  ].join('\n')
  const found = extractLinks(sample)
  const raws = found.map((link) => link.raw)
  for (const raw of [
    '/definitely-not-a-route',
    '/also-missing',
    '/quoted',
    '/blog/${post.slug}',
    '/missing-md',
    '/pricing',
    '/for/ios-app',
    'mailto:a@b.c',
    '/api/geo',
    'https://example.com/x',
    '/#generate',
    'https://privacypage.io/pricing',
    '/blog/nope',
  ]) {
    if (!raws.includes(raw)) failures.push(`extractor missed ${JSON.stringify(raw)}`)
  }
  const broken = found.filter((link) => classify(link.raw, index) === 'broken').map((link) => link.raw)
  for (const raw of ['/definitely-not-a-route', '/also-missing', '/quoted', '/missing-md', '/blog/nope']) {
    if (!broken.includes(raw)) failures.push(`detector did not fail ${JSON.stringify(raw)}`)
  }
  for (const raw of ['mailto:a@b.c', '/api/geo', 'https://example.com/x', '/#generate', '/pricing', '/for/ios-app', '/blog/${post.slug}', 'https://privacypage.io/pricing']) {
    if (broken.includes(raw)) failures.push(`detector false-failed ${JSON.stringify(raw)}`)
  }
  if (failures.length) {
    console.error(`Link checker self-test FAILED:\n- ${failures.join('\n- ')}`)
    process.exit(1)
  }
}

selfTest()

const { blogPosts } = await import(pathToFileURL(path.join(root, 'src/lib/blog.ts')).href)
const { platformPages } = await import(pathToFileURL(path.join(root, 'src/lib/platforms.ts')).href)
const { builderPages, competitorPages, regulationPages } = await import(
  pathToFileURL(path.join(root, 'src/lib/seo-pages.ts')).href
)

const errors = []

function slugsOf(pages, label) {
  const slugs = []
  for (const page of pages) {
    if (!page?.slug || page.slug.includes('/') || page.slug === '.' || page.slug === '..') {
      errors.push(`${label} has an unusable slug: ${JSON.stringify(page?.slug)}`)
      continue
    }
    slugs.push(page.slug)
  }
  return slugs
}

const slugData = {
  blogSlugs: slugsOf(blogPosts, 'blogPosts'),
  builderSlugs: slugsOf(builderPages, 'builderPages'),
  platformSlugs: slugsOf(platformPages, 'platformPages'),
  competitorSlugs: slugsOf(competitorPages, 'competitorPages'),
  regulationSlugs: slugsOf(regulationPages, 'regulationPages'),
}

function walkApp(dir, segments, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'api' || entry.name.startsWith('_') || entry.name.startsWith('@')) continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
      walkApp(full, isGroup ? segments : [...segments, entry.name], found)
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      found.pages.push(segments)
    } else if (/^route\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      found.handlers.push(segments)
    } else if (segments.length === 0 && METADATA_ROUTES[entry.name]) {
      found.meta.push(METADATA_ROUTES[entry.name])
    }
  }
  return found
}

function isDynamicSegment(segment) {
  return segment.startsWith('[') && segment.endsWith(']')
}

const discovered = walkApp(path.join(root, 'src/app'), [], { pages: [], handlers: [], meta: [] })
const routes = new Set(discovered.meta)
const patterns = []

function addRoute(segments, kind) {
  const dynamic = segments.filter(isDynamicSegment)
  if (!dynamic.length) {
    routes.add(segments.length ? `/${segments.join('/')}` : '/')
    return
  }
  if (dynamic.length > 1 || dynamic.some((segment) => !/^\[[^./[\]]+\]$/.test(segment))) {
    errors.push(`dynamic route not supported: /${segments.join('/')}`)
    return
  }
  if (kind !== 'page') {
    errors.push(`dynamic route handler has no slug source: /${segments.join('/')}`)
    return
  }
  const key = segments.join('/')
  const source = DYNAMIC_SLUGS[key]
  if (!source) {
    errors.push(`no slug source for /${key}; link check does not know which params render`)
    return
  }
  const slugs = [...new Set(source(slugData))]
  patterns.push(segments.map((segment) => (
    isDynamicSegment(segment) ? { dynamic: true } : { dynamic: false, static: segment }
  )))
  for (const slug of slugs) {
    routes.add(`/${segments.map((segment) => (isDynamicSegment(segment) ? slug : segment)).join('/')}`)
  }
}

for (const segments of discovered.pages) addRoute(segments, 'page')
for (const segments of discovered.handlers) addRoute(segments, 'route')

function walkPublic(dir, prefix, files) {
  if (!fs.existsSync(dir)) return files
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${prefix}/${entry.name}`
    if (entry.isDirectory()) walkPublic(path.join(dir, entry.name), rel, files)
    else files.add(rel)
  }
  return files
}

const publicFiles = walkPublic(path.join(root, 'public'), '', new Set())
const index = { routes, patterns, publicFiles }

function walkSources(dir, files) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkSources(full, files)
    else if (/\.(ts|tsx|md|mdx)$/.test(entry.name)) files.push(full)
    // platforms.ts loads these href strings from JSON; the .ts file does not inline them.
    else if (entry.name.endsWith('.json') && full.includes(`${path.sep}content${path.sep}`)) files.push(full)
  }
  return files
}

const broken = []
let checked = 0
for (const file of walkSources(path.join(root, 'src'), [])) {
  const text = fs.readFileSync(file, 'utf8')
  const rel = path.relative(root, file).split(path.sep).join('/')
  for (const link of extractLinks(text)) {
    const result = classify(link.raw, index)
    if (result === 'skip') continue
    checked++
    if (result === 'broken') {
      const normalised = normalisedOf(link.raw)
      const shown = link.raw.trim() === normalised ? normalised : `${link.raw.trim()} → ${normalised}`
      broken.push({ file: rel, line: lineAt(text, link.at), shown })
    }
  }
}

if (checked === 0) errors.push('no internal links found; the extractor is not seeing hrefs')

broken.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line)
for (const link of broken) errors.push(`${link.file}:${link.line}: ${link.shown}`)

if (errors.length) {
  console.error(`Internal link check FAILED (${errors.length}):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(`Internal link check passed: ${checked} links, ${routes.size} routes.`)
