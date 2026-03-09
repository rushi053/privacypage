import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PrivacyPage - Privacy Policy Generator for Apps'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #eef2ff 100%)',
          padding: '80px',
        }}
      >
        {/* Logo and Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
            <rect x="4" y="4" width="16" height="16" rx="2" fill="#4F46E5" opacity="0.1" />
            <path d="M8 6h8v12H8z" fill="#4F46E5" />
            <circle cx="12" cy="12" r="2" fill="white" />
          </svg>
          <div style={{ fontSize: '64px', fontWeight: 'bold', color: '#111827' }}>
            PrivacyPage
          </div>
        </div>

        {/* Main Message */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 'bold',
            color: '#111827',
            textAlign: 'center',
            marginBottom: '30px',
            lineHeight: 1.2,
          }}
        >
          Privacy policies for your app.
          <br />
          <span style={{ color: '#4F46E5' }}>Done in 60 seconds.</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            color: '#6b7280',
            textAlign: 'center',
            marginBottom: '50px',
          }}
        >
          Free • No Signup • GDPR &amp; CCPA Compliant
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {['GDPR', 'CCPA', 'App Store', 'Play Store'].map((badge) => (
            <div
              key={badge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '20px',
                color: '#4b5563',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill="#10b981">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {badge}
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
