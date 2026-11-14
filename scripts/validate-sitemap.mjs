#!/usr/bin/env node
// Checks src/app/sitemap.ts against the routes that actually render.
// Fails if the sitemap repeats a URL, points at a slug the page would not
// find, or omits a public page. No dependencies — Node's type stripper loads
// the sitemap module. Runs from `npm run validate:sitemap` and prebuild.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { registerHooks } from 'node:module'

const root = process.cwd()
const BASE = 'https://privacypage.io'
const errors = []
const fail = (message) => errors.push(message)

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (!specifier.startsWith('@/')) return nextResolve(specifier, context)
    const base = path.join(root, 'src', specifier.slice(2))
    const file = [base, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.mjs`, path.join(base, 'index.ts')]
      .find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    if (!file) fail(`cannot resolve ${specifier}`)
    return nextResolve(file ? pathToFileURL(file).href : specifier, context)
  },
})

const sitemapUrl = pathToFileURL(path.join(root, 'src/app/sitemap.ts')).href
const sitemapMod = await import(sitemapUrl)
const { blogPosts } = await import(pathToFileURL(path.join(root, 'src/lib/blog.ts')).href)
const { platformPages } = await import(pathToFileURL(path.join(root, 'src/lib/platforms.ts')).href)
const { builderPages, competitorPages, regulationPages } = await import(
  pathToFileURL(path.join(root, 'src/lib/seo-pages.ts')).href
)

const DAY = /^\d{4}-\d{2}-\d{2}$/
function isDay(value) {
  if (typeof value !== 'string' || !DAY.test(value)) return false
  return new Date(`${value}T00:00:00.000Z`).toISOString().slice(0, 10) === value
}

function duplicateUrls(entries) {
  const seen = new Set()
  const dupes = new Set()
  for (const entry of entries) {
    if (seen.has(entry.url)) dupes.add(entry.url)
    seen.add(entry.url)
  }
  return [...dupes]
}

// The detector has to catch a repeated URL. This fixture is the regression test.
if (duplicateUrls([{ url: 'https://example.test/a' }, { url: 'https://example.test/a' }]).join() !== 'https://example.test/a') {
  console.error('Sitemap validation FAILED: duplicate detector is broken')
  process.exit(1)
}

const merged = sitemapMod.mergeForSitemapEntries(
  [{ slug: 'shared' }, { slug: 'only-builder' }],
  [
    { slug: 'shared', storeRule: { verifiedOn: '2026-10-30' } },
    { slug: 'only-platform', storeRule: { verifiedOn: '2026-10-29' } },
  ],
)
const mergedBySlug = new Map(merged.map((entry) => [entry.url.split('/').pop(), entry]))
if (merged.length !== 3 || duplicateUrls(merged).length) fail('mergeForSitemapEntries emitted duplicate /for URLs')
const shared = mergedBySlug.get('shared')
if (!shared || shared.lastModified !== '2026-10-30' || shared.priority !== 0.9) {
  fail('a shared /for slug must keep the platform verifiedOn and priority')
}
if (mergedBySlug.get('only-builder')?.lastModified !== sitemapMod.BUILDER_CONTENT_DATE) {
  fail('a builder-only /for slug must keep the builder content date')
}
if (mergedBySlug.get('only-platform')?.priority !== 0.9) fail('a platform-only /for slug must keep platform priority')

const sitemapSource = fs.readFileSync(path.join(root, 'src/app/sitemap.ts'), 'utf8')
if (!sitemapSource.includes('mergeForSitemapEntries(builderPages, platformPages)')) {
  fail('sitemap.ts must build /for URLs with mergeForSitemapEntries(builderPages, platformPages)')
}
if (sitemapSource.includes('new Date')) fail('sitemap.ts must not stamp lastModified from the build clock')

const guideSource = fs.readFileSync(
  path.join(root, 'src/app/guides/app-rejected-privacy-policy/page.tsx'),
  'utf8',
)
const guideVerified = guideSource.match(/const VERIFIED = '(\d{4}-\d{2}-\d{2})'/)
if (!guideVerified) fail('guide page is missing const VERIFIED = YYYY-MM-DD')
else if (sitemapMod.GUIDE_CONTENT_DATE !== guideVerified[1]) {
  fail(`GUIDE_CONTENT_DATE ${sitemapMod.GUIDE_CONTENT_DATE} != guide VERIFIED ${guideVerified[1]}`)
}

function slugsOf(pages, label) {
  const seen = new Set()
  const slugs = []
  for (const page of pages) {
    if (!page.slug || page.slug.includes('/') || page.slug === '.' || page.slug === '..') {
      fail(`${label} has an unusable slug: ${JSON.stringify(page.slug)}`)
      continue
    }
    if (seen.has(page.slug)) fail(`${label} repeats slug ${page.slug}`)
    seen.add(page.slug)
    slugs.push(page.slug)
  }
  return slugs
}

const blogSlugs = slugsOf(blogPosts, 'blogPosts')
const builderSlugs = slugsOf(builderPages, 'builderPages')
const platformSlugs = slugsOf(platformPages, 'platformPages')
const competitorSlugs = slugsOf(competitorPages, 'competitorPages')
const regulationSlugs = slugsOf(regulationPages, 'regulationPages')

for (const post of blogPosts) if (!isDay(post.date)) fail(`blog post ${post.slug} has no YYYY-MM-DD date`)
for (const page of platformPages) {
  if (!isDay(page.storeRule?.verifiedOn)) fail(`platform ${page.slug} has no storeRule.verifiedOn date`)
}
for (const [name, value] of [
  ['BUILDER_CONTENT_DATE', sitemapMod.BUILDER_CONTENT_DATE],
  ['COMPETITOR_CONTENT_DATE', sitemapMod.COMPETITOR_CONTENT_DATE],
  ['REGULATION_CONTENT_DATE', sitemapMod.REGULATION_CONTENT_DATE],
  ['STATIC_CONTENT_DATE', sitemapMod.STATIC_CONTENT_DATE],
  ['GUIDE_CONTENT_DATE', sitemapMod.GUIDE_CONTENT_DATE],
]) {
  if (!isDay(value)) fail(`${name} is not a real YYYY-MM-DD`)
}
if (!blogPosts.length) fail('blogPosts is empty; /blog lastModified has no source date')

const dynamicSlugs = {
  'blog/[slug]': blogSlugs,
  'for/[builder]': [...new Set([...builderSlugs, ...platformSlugs])],
  'vs/[competitor]': competitorSlugs,
  'compliance/[regulation]': regulationSlugs,
}

function walkPages(dir, segments = [], found = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'api') continue
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const isGroup = entry.name.startsWith('(') && entry.name.endsWith(')')
      walkPages(full, isGroup ? segments : [...segments, entry.name], found)
    } else if (/^page\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      found.push(segments)
    }
  }
  return found
}

const expected = new Set()
for (const segments of walkPages(path.join(root, 'src/app'))) {
  const dynamic = segments.filter((segment) => segment.startsWith('[') && segment.endsWith(']'))
  if (!dynamic.length) {
    expected.add(segments.length ? `${BASE}/${segments.join('/')}` : BASE)
    continue
  }
  if (dynamic.length > 1) {
    fail(`nested dynamic route not supported: /${segments.join('/')}`)
    continue
  }
  const pattern = segments.join('/')
  const slugs = dynamicSlugs[pattern]
  if (!slugs) {
    fail(`no slug source for /${pattern}; sitemap check does not know if it renders`)
    continue
  }
  for (const slug of slugs) expected.add(`${BASE}/${segments.map((segment) => (segment.startsWith('[') ? slug : segment)).join('/')}`)
}

const entries = sitemapMod.default()
if (!Array.isArray(entries) || !entries.length) fail('sitemap() returned no entries')

const dupes = duplicateUrls(entries)
for (const url of dupes) fail(`duplicate sitemap URL: ${url}`)

const emitted = new Set(entries.map((entry) => entry.url))
for (const entry of entries) {
  const onSite = entry.url === BASE || (typeof entry.url === 'string' && entry.url.startsWith(`${BASE}/`))
  if (!onSite) fail(`sitemap URL is not on ${BASE}: ${entry.url}`)
  if (typeof entry.url === 'string' && entry.url !== BASE && entry.url.endsWith('/')) fail(`trailing slash: ${entry.url}`)
  if (!isDay(entry.lastModified)) fail(`lastModified is not a stable YYYY-MM-DD: ${entry.url} = ${entry.lastModified}`)
  if (!expected.has(entry.url)) fail(`sitemap URL does not resolve to a page: ${entry.url}`)
}
for (const url of expected) if (!emitted.has(url)) fail(`public page missing from sitemap: ${url}`)

const byUrl = new Map(entries.map((entry) => [entry.url, entry]))
const platformBySlug = new Map(platformPages.map((page) => [page.slug, page]))
const newestPost = blogPosts.length ? latestOf(blogPosts.map((post) => post.date)) : ''

function latestOf(dates) {
  return dates.reduce((max, date) => (date > max ? date : max))
}

const staticUrls = [BASE, `${BASE}/pricing`, `${BASE}/for`]
for (const url of staticUrls) {
  const entry = byUrl.get(url)
  if (entry && entry.lastModified !== sitemapMod.STATIC_CONTENT_DATE) fail(`${url} must use STATIC_CONTENT_DATE`)
}
const guideEntry = byUrl.get(`${BASE}/guides/app-rejected-privacy-policy`)
if (guideEntry && guideEntry.lastModified !== guideVerified?.[1]) {
  fail('rejection guide lastModified must be the page VERIFIED date')
}
const blogIndex = byUrl.get(`${BASE}/blog`)
if (blogIndex && blogIndex.lastModified !== newestPost) fail('/blog lastModified must be the newest post.date')

for (const post of blogPosts) {
  const entry = byUrl.get(`${BASE}/blog/${post.slug}`)
  if (entry && entry.lastModified !== post.date) fail(`/blog/${post.slug} lastModified must be post.date`)
}
for (const page of platformPages) {
  const entry = byUrl.get(`${BASE}/for/${page.slug}`)
  if (!entry) continue
  if (entry.lastModified !== page.storeRule.verifiedOn) fail(`/for/${page.slug} must use storeRule.verifiedOn`)
  if (entry.priority !== 0.9) fail(`/for/${page.slug} must keep the platform priority`)
}
for (const page of builderPages) {
  if (platformBySlug.has(page.slug)) continue
  const entry = byUrl.get(`${BASE}/for/${page.slug}`)
  if (entry && entry.lastModified !== sitemapMod.BUILDER_CONTENT_DATE) {
    fail(`/for/${page.slug} must use BUILDER_CONTENT_DATE`)
  }
}
for (const page of competitorPages) {
  const entry = byUrl.get(`${BASE}/vs/${page.slug}`)
  if (entry && entry.lastModified !== sitemapMod.COMPETITOR_CONTENT_DATE) {
    fail(`/vs/${page.slug} must use COMPETITOR_CONTENT_DATE`)
  }
}
for (const page of regulationPages) {
  const entry = byUrl.get(`${BASE}/compliance/${page.slug}`)
  if (entry && entry.lastModified !== sitemapMod.REGULATION_CONTENT_DATE) {
    fail(`/compliance/${page.slug} must use REGULATION_CONTENT_DATE`)
  }
}

const collisions = builderSlugs.filter((slug) => platformBySlug.has(slug))
if (errors.length) {
  console.error(`Sitemap validation FAILED (${errors.length}):\n- ${errors.join('\n- ')}`)
  process.exit(1)
}

console.log(
  `Sitemap validation passed: ${entries.length} URLs, ${collisions.length} builder/platform slug collision(s), ${expected.size} public pages.`,
)
if (collisions.length) console.log(`Platform entry kept for: ${collisions.join(', ')}`)
