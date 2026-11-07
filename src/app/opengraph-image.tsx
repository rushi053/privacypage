import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'PrivacyPage - Privacy Policy Generator for Apps'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const seal = '#0F5C63'
const paper = '#F7F7F5'
const ink = '#16181D'
const inkMuted = 'rgba(22, 24, 29, 0.6)'

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
          background: paper,
          padding: '80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="6" fill={seal} />
            <path
              d="M16 8L10 11V15C10 19.5 12.5 23.5 16 24.5C19.5 23.5 22 19.5 22 15V11L16 8Z"
              fill="white"
              stroke="white"
              strokeWidth="0.5"
              strokeLinejoin="round"
            />
            <path
              d="M19 14L15 18L13 16"
              stroke={seal}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ fontSize: '64px', fontWeight: 700, color: ink }}>
            PrivacyPage
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: '56px',
            fontWeight: 700,
            color: ink,
            textAlign: 'center',
            marginBottom: '30px',
            lineHeight: 1.2,
          }}
        >
          <div style={{ display: 'flex' }}>Privacy policies for your app.</div>
          <div style={{ display: 'flex', color: seal }}>Done in 60 seconds.</div>
        </div>

        <div
          style={{
            fontSize: '28px',
            color: inkMuted,
            textAlign: 'center',
            marginBottom: '50px',
          }}
        >
          Free • No Signup • GDPR &amp; CCPA Compliant
        </div>

        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          {['GDPR', 'CCPA', 'App Store', 'Play Store'].map((badge) => (
            <div
              key={badge}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '20px',
                color: inkMuted,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 20 20" fill={seal}>
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
