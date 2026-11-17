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
      <div style={{ width: '100%', height: '100%', background: '#F7F7F5', color: '#16181D', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
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
          background: '#F7F7F5',
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '40px' }}>
          <div style={{ width: '8px', height: '40px', background: '#0F5C63' }} />
          <div style={{ fontSize: '28px', color: '#16181D' }}>
            PrivacyPage Blog
          </div>
        </div>

        <div
          style={{
            fontSize: '56px',
            color: '#16181D',
            lineHeight: 1.15,
            marginBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
          }}
        >
          {post.title}
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#4A4E57',
            lineHeight: 1.5,
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          {post.description.slice(0, 120)}...
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', fontSize: '20px', color: '#0F5C63' }}>
          <div>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          <div>·</div>
          <div>{post.readTime}</div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
