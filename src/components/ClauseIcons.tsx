// One 1.5px-stroke line icon set for the Clause UI. No emoji.
type P = { className?: string }
const base = (d: React.ReactNode, className = 'w-4 h-4') => (
  <svg aria-hidden className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
)
export const CheckIcon = ({ className }: P) => base(<path d="M5 12.5l4.5 4.5L19 7.5" />, className)
export const LockIcon = ({ className }: P) => base(<><rect x="5" y="10.5" width="14" height="9.5" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></>, className)
export const CopyIcon = ({ className }: P) => base(<><rect x="8.5" y="8.5" width="11" height="11" rx="2" /><path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" /></>, className)
export const DownloadIcon = ({ className }: P) => base(<><path d="M12 4v11" /><path d="M7.5 10.5L12 15l4.5-4.5" /><path d="M5 19.5h14" /></>, className)
export const ArrowRightIcon = ({ className }: P) => base(<><path d="M5 12h14" /><path d="M13.5 6.5L19 12l-5.5 5.5" /></>, className)
export const ArrowLeftIcon = ({ className }: P) => base(<><path d="M19 12H5" /><path d="M10.5 6.5L5 12l5.5 5.5" /></>, className)
export const RefreshIcon = ({ className }: P) => base(<><path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" /><path d="M19.5 4.5v4h-4" /></>, className)
export const KeyIcon = ({ className }: P) => base(<><circle cx="8" cy="15" r="3.5" /><path d="M10.5 12.5L19 4M16 7l2.5 2.5M14 9l1.5 1.5" /></>, className)
export const MenuIcon = ({ className }: P) => base(<path d="M4 7h16M4 12h16M4 17h16" />, className)
export const CloseIcon = ({ className }: P) => base(<path d="M6 6l12 12M18 6L6 18" />, className)
export const ChevronDownIcon = ({ className }: P) => base(<path d="M6 9.5l6 6 6-6" />, className)
export const DocIcon = ({ className }: P) => base(<><path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" /><path d="M14 3.5v5h5M9 13h6M9 16.5h4" /></>, className)
export const ShieldIcon = ({ className }: P) => base(<><path d="M12 3.5l7 3v5.5c0 4.2-2.9 7.6-7 8.5-4.1-.9-7-4.3-7-8.5V6.5z" /><path d="M9 12l2 2 4-4" /></>, className)
export const CookieIcon = ({ className }: P) => base(<><path d="M20 12.5A8 8 0 1 1 11.5 4a3 3 0 0 0 3.5 3.5 3 3 0 0 0 5 5z" /><path d="M8.5 11h.01M12 15.5h.01M15.5 14h.01M9.5 15.5h.01" /></>, className)
export const AlertIcon = ({ className }: P) => base(<><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17h.01" /></>, className)
