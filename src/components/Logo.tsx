export function Logo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="6" fill="#4f46e5"/>
      <path d="M16 8L10 11V15C10 19.5 12.5 23.5 16 24.5C19.5 23.5 22 19.5 22 15V11L16 8Z" fill="white" stroke="white" strokeWidth="0.5" strokeLinejoin="round"/>
      <path d="M19 14L15 18L13 16" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
