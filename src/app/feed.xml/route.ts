import { blogPosts } from '@/lib/blog'

const SITE_URL = 'https://privacypage.io'

export const dynamic = 'force-static'

function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

/** RSS 2.0 pubDate / lastBuildDate: RFC 822, four-digit year (RFC 1123 profile). */
function toRfc822(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00.000Z`).toUTCString()
}

export function GET() {
  const posts = [...blogPosts].sort((a, b) => b.date.localeCompare(a.date))
  const lastBuildDate = posts.length > 0 ? toRfc822(posts[0].date) : new Date(0).toUTCString()

  const items = posts
    .map((post) => {
      const permalink = `${SITE_URL}/blog/${post.slug}`
      return [
        '    <item>',
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${escapeXml(permalink)}</link>`,
        `      <guid isPermaLink="true">${escapeXml(permalink)}</guid>`,
        `      <pubDate>${toRfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.description)}</description>`,
        '    </item>',
      ].join('\n')
    })
    .join('\n')

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0">',
    '  <channel>',
    '    <title>PrivacyPage</title>',
    `    <link>${SITE_URL}</link>`,
    '    <description>Guides on privacy policies and legal docs for apps.</description>',
    '    <language>en</language>',
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    items,
    '  </channel>',
    '</rss>',
    '',
  ].join('\n')

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
