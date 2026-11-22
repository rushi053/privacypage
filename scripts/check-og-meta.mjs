#!/usr/bin/env node
// Scans prerendered HTML under .next/server/app (after `npm run build`).
// Fails if any page is missing og:image, twitter:image, or
// twitter:card=summary_large_image. Zero dependencies.
//
// Reads `.next/server/app` produced by `next build`, so it runs after the
// build, not in `prebuild`. Run with `npm run check:og-meta`, or both
// post-build checks via `npm run check:postbuild`.

import fs from 'node:fs'
import path from 'node:path'

const appDir = path.join(process.cwd(), '.next', 'server', 'app')

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

function metaTags(html) {
  return html.match(/<meta\b[^>]*>/gi) ?? []
}

function attr(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'))
  if (!match) return undefined
  return match[1] ?? match[2] ?? ''
}

function tagsNamed(html, attribute, expected) {
  const hits = []
  for (const tag of metaTags(html)) {
    if (attr(tag, attribute) !== expected) continue
    hits.push(attr(tag, 'content') ?? '')
  }
  return hits
}

const files = walk(appDir).sort()
if (files.length === 0) {
  console.error(`check-og-meta: no HTML under ${appDir}. Run \`npm run build\` first.`)
  process.exit(1)
}

const offenders = []
let withOg = 0
let withTwitterImage = 0
let withCard = 0

for (const file of files) {
  const html = fs.readFileSync(file, 'utf8')
  const route = path.relative(appDir, file).replace(/\\/g, '/')
  const og = tagsNamed(html, 'property', 'og:image').filter(Boolean)
  const tw = tagsNamed(html, 'name', 'twitter:image').filter(Boolean)
  const card = tagsNamed(html, 'name', 'twitter:card').filter(Boolean)
  const missing = []
  if (og.length === 0) missing.push('og:image')
  else withOg += 1
  if (tw.length === 0) missing.push('twitter:image')
  else withTwitterImage += 1
  if (!card.includes('summary_large_image')) missing.push('twitter:card=summary_large_image')
  else withCard += 1
  if (missing.length) offenders.push({ route, missing })
}

console.log(
  `check-og-meta: ${files.length} prerendered pages, ${withOg} with og:image, ${withTwitterImage} with twitter:image, ${withCard} with twitter:card=summary_large_image`,
)

if (offenders.length) {
  console.error(`check-og-meta FAILED: ${offenders.length} page(s) missing social image tags`)
  for (const { route, missing } of offenders) {
    console.error(`  ${route} — missing ${missing.join(', ')}`)
  }
  process.exit(1)
}

console.log('check-og-meta: ok')
