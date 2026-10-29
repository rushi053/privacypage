#!/usr/bin/env node
// Validates src/content/platforms/*.json. Exits 1 on any problem -> runs as
// `prebuild`, so `next build` fails if a platform page is incomplete.
// `--check-urls` additionally fetches every source URL.
import fs from 'node:fs'
import path from 'node:path'

const DIR = path.join(process.cwd(), 'src/content/platforms')
const DEDICATED = { ios: 'ios-app', android: 'android-app' } // only real templates
const errors = []
const urls = new Set()
const err = (f, m) => errors.push(`${f}: ${m}`)
const str = (v) => typeof v === 'string' && v.trim().length > 0
const isUrl = (v) => str(v) && /^https:\/\/[^\s]+$/.test(v)

export function validate(file, d) {
  for (const k of ['slug', 'name', 'h1', 'metaTitle', 'metaDescription', 'answer'])
    if (!str(d[k])) err(file, `missing "${k}"`)
  if (d.slug && `${d.slug}.json` !== path.basename(file)) err(file, 'slug must equal filename')

  if (!['ios', 'android', 'general'].includes(d.templateAvailability))
    err(file, 'templateAvailability must be "ios" | "android" | "general"')
  else if (d.templateAvailability !== 'general' && DEDICATED[d.templateAvailability] !== d.slug)
    err(file, `only ${Object.values(DEDICATED).join(', ')} may claim a dedicated template`)

  const r = d.storeRule || {}
  for (const k of ['store', 'title', 'quote', 'verifiedOn']) if (!str(r[k])) err(file, `storeRule.${k} missing`)
  if (!isUrl(r.sourceUrl)) err(file, 'storeRule.sourceUrl must be an https URL'); else urls.add(r.sourceUrl)
  if (r.verifiedOn && !/^\d{4}-\d{2}-\d{2}$/.test(r.verifiedOn)) err(file, 'storeRule.verifiedOn must be YYYY-MM-DD')

  if (!Array.isArray(d.sdks) || d.sdks.length === 0) err(file, 'sdks[] required (at least one)')
  else d.sdks.forEach((s, i) => {
    if (!str(s.name)) err(file, `sdks[${i}].name missing`)
    if (!Array.isArray(s.dataCollected) || !s.dataCollected.length || !s.dataCollected.every(str))
      err(file, `sdks[${i}].dataCollected must be a non-empty string[]`)
    if (!isUrl(s.sourceUrl)) err(file, `sdks[${i}].sourceUrl must be an https URL`); else urls.add(s.sourceUrl)
  })

  ;(d.additionalRules || []).forEach((a, i) => {
    if (!str(a.title) || !str(a.text)) err(file, `additionalRules[${i}] needs title+text`)
    if (!isUrl(a.sourceUrl)) err(file, `additionalRules[${i}].sourceUrl must be an https URL`); else urls.add(a.sourceUrl)
  })

  if (!str(d.sampleClause?.heading) || !str(d.sampleClause?.text)) err(file, 'sampleClause.heading + sampleClause.text required')
  if (!Array.isArray(d.whereToPaste) || !d.whereToPaste.length) err(file, 'whereToPaste[] required')
  if (!Array.isArray(d.faqs) || !d.faqs.length || !d.faqs.every((f) => str(f.q) && str(f.a))) err(file, 'faqs[] with q+a required')

  // Copy rules: no approval/guarantee claims; general pages never promise a platform template.
  const text = JSON.stringify(d)
  if (/\b(store[- ]approved|guaranteed? approval|approved by (apple|google))\b/i.test(text)) err(file, 'forbidden approval/guarantee claim')
  if (d.templateAvailability === 'general') {
    const prose = JSON.stringify({ ...d, faqs: (d.faqs || []).map((f) => f.a) })
    for (const m of prose.matchAll(/[^."]*\btemplates?\b[^."]*/gi))
      if (!/^\s*no\b|\bno\b|\bnot\b|general app policy/i.test(m[0])) err(file, `general page mentions a template: "${m[0].trim()}"`)
  }
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.json'))
if (!files.length) err(DIR, 'no platform files')
for (const f of files) {
  try { validate(f, JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'))) }
  catch (e) { err(f, `invalid JSON: ${e.message}`) }
}

if (process.argv.includes('--check-urls')) {
  for (const u of urls) {
    try {
      const res = await fetch(u, { redirect: 'follow', headers: { 'user-agent': 'Mozilla/5.0 (PrivacyPage source check)' } })
      if (res.status === 403) console.warn(`WARN 403 (bot-blocked, verify manually): ${u}`)
      else if (!res.ok) err('urls', `${res.status} ${u}`)
      else console.log(`OK ${res.status} ${u}`)
    } catch (e) { err('urls', `${e.message} ${u}`) }
  }
}

if (errors.length) { console.error(`Platform validation FAILED (${errors.length}):\n- ` + errors.join('\n- ')); process.exit(1) }
console.log(`Platform validation passed: ${files.length} pages, ${urls.size} source URLs.`)
