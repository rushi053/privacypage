import type { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog'
import { platformPages } from '@/lib/platforms'
import { builderPages, competitorPages, regulationPages } from '@/lib/seo-pages'

const BASE_URL = 'https://privacypage.io'

/**
 * Builder, competitor, and regulation pages have no per-page date.
 * They shipped together on 2026-08-30 (8db5573). Competitor copy says
 * pricing was checked in August 2026. The 2026-10-29 edit (0786da4) only
 * swapped hard-coded USD amounts for PRICE.* and did not touch
 * regulationPages, so each collection stays on that ship date.
 */
export const BUILDER_CONTENT_DATE = '2026-08-30'
export const COMPETITOR_CONTENT_DATE = '2026-08-30'
export const REGULATION_CONTENT_DATE = '2026-08-30'

/**
 * Home, /pricing, and /for have no date field. They were last updated
 * together on 2026-10-30 (647406f).
 */
export const STATIC_CONTENT_DATE = '2026-10-30'

/**
 * Must match `const VERIFIED` in
 * src/app/guides/app-rejected-privacy-policy/page.tsx.
 * scripts/validate-sitemap.mjs fails the build if they diverge.
 */
export const GUIDE_CONTENT_DATE = '2026-10-30'

type ForBuilder = { slug: string }
type ForPlatform = { slug: string; storeRule: { verifiedOn: string } }

/** One /for/<slug> entry. A platform page replaces a builder page with the same slug. */
export function mergeForSitemapEntries(
  builders: ForBuilder[],
  platforms: ForPlatform[],
): MetadataRoute.Sitemap {
  const bySlug = new Map<string, MetadataRoute.Sitemap[number]>()
  for (const page of builders) {
    bySlug.set(page.slug, {
      url: `${BASE_URL}/for/${page.slug}`,
      lastModified: BUILDER_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }
  for (const page of platforms) {
    bySlug.set(page.slug, {
      url: `${BASE_URL}/for/${page.slug}`,
      lastModified: page.storeRule.verifiedOn,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
  }
  return [...bySlug.values()].sort((a, b) => a.url.localeCompare(b.url))
}

function latestDate(dates: string[]): string {
  return dates.reduce((max, date) => (date > max ? date : max))
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: STATIC_CONTENT_DATE, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/pricing`, lastModified: STATIC_CONTENT_DATE, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/for`, lastModified: STATIC_CONTENT_DATE, changeFrequency: 'weekly', priority: 0.9 },
    {
      url: `${BASE_URL}/guides/app-rejected-privacy-policy`,
      lastModified: GUIDE_CONTENT_DATE,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: latestDate(blogPosts.map((post) => post.date)),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    ...blogPosts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...mergeForSitemapEntries(builderPages, platformPages),
    ...competitorPages.map((page) => ({
      url: `${BASE_URL}/vs/${page.slug}`,
      lastModified: COMPETITOR_CONTENT_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...regulationPages.map((page) => ({
      url: `${BASE_URL}/compliance/${page.slug}`,
      lastModified: REGULATION_CONTENT_DATE,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
