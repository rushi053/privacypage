// Data-driven platform pages. One JSON per platform in src/content/platforms.
// Schema enforced at build time by scripts/validate-platforms.mjs (prebuild).
// Adding a platform = dropping a new JSON file in that folder; routing,
// sitemap and llms links pick it up automatically.
import fs from 'node:fs'
import path from 'node:path'

export interface SourcedRule { title: string; text: string; sourceUrl: string }
export interface PlatformSdk { name: string; dataCollected: string[]; sourceUrl: string; note?: string }
export interface PlatformPage {
  slug: string
  name: string
  h1: string
  metaTitle: string
  metaDescription: string
  answer: string
  /** Only iOS and Android have dedicated templates; all others use the general app policy. */
  templateAvailability: 'ios' | 'android' | 'general'
  storeRule: { store: string; title: string; quote: string; sourceUrl: string; verifiedOn: string }
  additionalRules: SourcedRule[]
  sdks: PlatformSdk[]
  whereToPaste: string[]
  whereToPasteSource?: string
  sampleClause: { heading: string; text: string }
  faqs: { q: string; a: string }[]
  related: { href: string; label: string }[]
}

const DIR = path.join(process.cwd(), 'src/content/platforms')

export const platformPages: PlatformPage[] = fs
  .readdirSync(DIR)
  .filter((f) => f.endsWith('.json'))
  .sort()
  .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8')) as PlatformPage)

export function getPlatformPage(slug: string) {
  return platformPages.find((p) => p.slug === slug)
}
