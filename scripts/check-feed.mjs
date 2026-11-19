#!/usr/bin/env node
// After `npm run build`, checks two things:
//   1. Prerendered /, /blog, and each blog post advertise the RSS feed
//      without dropping their canonical.
//   2. The feed route's item links match blog slugs, and the channel <link>
//      plus <atom:link rel="self"> are absolute https://privacypage.io URLs.
// Not wired into package.json or CI. Run after `npm run build`:
//   node --disable-warning=MODULE_TYPELESS_PACKAGE_JSON scripts/check-feed.mjs

import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { registerHooks } from 'node:module'

const root = process.cwd()
const appDir = path.join(root, '.next', 'server', 'app')
const SITE = 'https://privacypage.io'
const FEED_URL = `${SITE}/feed.xml`
const FEED_TITLE = 'PrivacyPage blog'
const errors = []
const fail = (message) => errors.push(message)

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

function walk(dir) {
  if (!fs.existsSync(dir)) return []
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...walk(full))
    else if (entry.name.endsWith('.html')) out.push(full)
  }
  return out
}

function routeFromHtml(file) {
  let rel = path.relative(appDir, file).replace(/\\/g, '/')
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'/index.html'.length)
  else if (rel.endsWith('.html')) rel = rel.slice(0, -'.html'.length)
  return rel
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
  if (!match) return undefined
  return match[1] ?? match[2] ?? ''
}

function linkTags(html) {
  return html.match(/<link\b[^>]*>/gi) ?? []
}

function isRssAlternate(tag) {
  return attr(tag, 'rel') === 'alternate'
    && attr(tag, 'type') === 'application/rss+xml'
    && attr(tag, 'href') === FEED_URL
    && attr(tag, 'title') === FEED_TITLE
}

function canonicalHref(html) {
  return linkTags(html)
    .filter((tag) => attr(tag, 'rel') === 'canonical')
    .map((tag) => attr(tag, 'href'))
}

function assertFeedAndCanonical(file, expectedCanonical) {
  const html = fs.readFileSync(file, 'utf8')
  const route = routeFromHtml(file)
  const rss = linkTags(html).filter(isRssAlternate)
  if (rss.length !== 1) {
    fail(`${route}: expected one RSS alternate link (${FEED_URL}), found ${rss.length}`)
  }
  const canonicals = canonicalHref(html)
  if (canonicals.length !== 1 || canonicals[0] !== expectedCanonical) {
    fail(`${route}: expected canonical ${expectedCanonical}, found ${canonicals.join(', ') || '(none)'}`)
  }
}

function decodeXml(value) {
  return value
    .replaceAll('&apos;', "'")
    .replaceAll('&quot;', '"')
    .replaceAll('&gt;', '>')
    .replaceAll('&lt;', '<')
    .replaceAll('&amp;', '&')
}

const { blogPosts } = await import(pathToFileURL(path.join(root, 'src/lib/blog.ts')).href)
const { GET } = await import(pathToFileURL(path.join(root, 'src/app/feed.xml/route.ts')).href)

const response = GET()
const xml = await response.text()
const contentType = response.headers.get('content-type') || ''
if (!contentType.includes('application/rss+xml')) {
  fail(`feed Content-Type is ${contentType || '(missing)'}, expected application/rss+xml`)
}

const channelHead = xml.split('<item>')[0] ?? ''
const channelLink = channelHead.match(/<link>([^<]*)<\/link>/)?.[1]
if (channelLink !== SITE) {
  fail(`feed channel <link> is ${channelLink || '(missing)'}, expected ${SITE}`)
}

const selfLinks = (xml.match(/<atom:link\b[^>]*>/gi) ?? []).filter((tag) => attr(tag, 'rel') === 'self')
if (selfLinks.length !== 1 || attr(selfLinks[0], 'href') !== FEED_URL) {
  const hrefs = selfLinks.map((tag) => attr(tag, 'href') || '(no href)')
  fail(`feed <atom:link rel="self"> expected ${FEED_URL}, found ${hrefs.join(', ') || '(none)'}`)
}

const slugs = blogPosts.map((post) => post.slug)
const slugSet = new Set(slugs)
const itemLinks = (xml.match(/<item>[\s\S]*?<\/item>/g) ?? []).map((block) => {
  const raw = block.match(/<link>([^<]*)<\/link>/)?.[1] ?? ''
  return decodeXml(raw.trim())
})

if (itemLinks.length !== slugs.length) {
  fail(`feed has ${itemLinks.length} item links, blog has ${slugs.length} posts`)
}

const seen = new Set()
for (const link of itemLinks) {
  let url
  try {
    url = new URL(link)
  } catch {
    fail(`feed item link is not absolute: ${link}`)
    continue
  }
  if (url.origin !== SITE) {
    fail(`feed item link is not on ${SITE}: ${link}`)
    continue
  }
  const match = url.pathname.match(/^\/blog\/([^/]+)$/)
  if (!match || !slugSet.has(match[1])) {
    fail(`feed item link does not match a blog post slug: ${link}`)
    continue
  }
  seen.add(match[1])
}
for (const slug of slugs) {
  if (!seen.has(slug)) fail(`feed is missing blog post ${slug}`)
}

const htmlFiles = walk(appDir)
if (htmlFiles.length === 0) {
  fail(`no HTML under ${appDir}. Run \`npm run build\` first.`)
} else {
  const byRoute = new Map(htmlFiles.map((file) => [routeFromHtml(file), file]))
  const home = byRoute.get('index')
  if (!home) fail('prerendered / HTML not found')
  else assertFeedAndCanonical(home, SITE)

  const blogIndex = byRoute.get('blog')
  if (!blogIndex) fail('prerendered /blog HTML not found')
  else assertFeedAndCanonical(blogIndex, `${SITE}/blog`)

  for (const slug of slugs) {
    const file = byRoute.get(`blog/${slug}`)
    if (!file) fail(`prerendered /blog/${slug} HTML not found`)
    else assertFeedAndCanonical(file, `${SITE}/blog/${slug}`)
  }

  const pricing = byRoute.get('pricing')
  if (pricing) {
    const html = fs.readFileSync(pricing, 'utf8')
    const canonicals = canonicalHref(html)
    if (canonicals.length !== 1 || canonicals[0] !== `${SITE}/pricing`) {
      fail(`pricing canonical changed: ${canonicals.join(', ') || '(none)'}`)
    }
  }
}

if (errors.length) {
  console.error(`check-feed FAILED: ${errors.length} problem(s)`)
  for (const message of errors) console.error(`  ${message}`)
  process.exit(1)
}

console.log(`check-feed: ok (${slugs.length} feed items; /, /blog, and post HTML advertise ${FEED_URL})`)
