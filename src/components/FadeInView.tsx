// Clause: no scroll-reveal on content (SEO + perceived speed). Kept as a
// passthrough so existing imports keep working.
export function FadeInView({ children }: { children: React.ReactNode; delay?: number; className?: string }) {
  return <>{children}</>
}
export default FadeInView
