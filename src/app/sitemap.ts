import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blog'
import { builderPages, competitorPages, regulationPages } from '@/lib/seo-pages'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://privacypage.io'
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...blogPosts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...builderPages.map((page) => ({
      url: `${baseUrl}/for/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...competitorPages.map((page) => ({
      url: `${baseUrl}/vs/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...regulationPages.map((page) => ({
      url: `${baseUrl}/compliance/${page.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
