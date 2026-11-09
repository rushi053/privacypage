import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Geometry matches src/components/Logo.tsx (32×32 viewBox), scaled to 180×180.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: 'flex',
          // Solid, unrounded square: iOS applies its own corner mask.
          background: '#0F5C63',
        }}
      >
        <svg width="180" height="180" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" fill="#0F5C63" />
          <path
            d="M16 8L10 11V15C10 19.5 12.5 23.5 16 24.5C19.5 23.5 22 19.5 22 15V11L16 8Z"
            fill="white"
            stroke="white"
            strokeWidth="0.5"
            strokeLinejoin="round"
          />
          <path
            d="M19 14L15 18L13 16"
            fill="none"
            stroke="#0F5C63"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  )
}
