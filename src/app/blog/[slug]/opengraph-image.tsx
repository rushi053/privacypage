import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog'

export const runtime = 'edge'
export const alt = 'PrivacyPage Blog Post'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  
  if (!post) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: 'white', display: 'flex' }}>
        <div>Post not found</div>
      </div>
    )
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #eef2ff 100%)',
          padding: '80px',
        }}
      >
        {/* Logo and Site Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' }}>
          <svg width="50" height="50" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#4F46E5" opacity="0.1" />
            <path d="M8 6h8v12H8z" fill="#4F46E5" />
            <circle cx="12" cy="12" r="2" fill="white" />
          </svg>
          <div style={{ fontSize: '32px', fontWeight: '600', color: '#111827' }}>
            PrivacyPage Blog
          </div>
        </div>

        {/* Post Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#111827',
            lineHeight: 1.15,
            marginBottom: '30px',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {post.title}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#6b7280',
            lineHeight: 1.4,
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          {post.description.slice(0, 120)}...
        </div>

        {/* Meta */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center', fontSize: '20px', color: '#9ca3af' }}>
          <div>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div>•</div>
          <div>{post.readTime}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
