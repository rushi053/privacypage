// Shared by error.tsx and global-error.tsx so both recovery pages offer the
// same actions with the same styles. Plain <a> tags: global-error replaces the
// root layout, so a full navigation is the safest way out.
const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-seal";

const linkClass = `h-12 inline-flex items-center px-2 text-[16px] text-ink/70 hover:text-ink underline underline-offset-4 decoration-ink/20 rounded-[4px] ${focusRing}`;

export function ErrorActions({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <button
        type="button"
        onClick={() => reset()}
        className={`h-12 inline-flex items-center px-6 bg-seal hover:bg-seal-dark text-white rounded-[8px] text-[16px] font-medium transition-colors cursor-pointer ${focusRing}`}
      >
        Try again
      </button>
      <a href="/" className={linkClass}>
        Home
      </a>
      <a href="/#generate" className={linkClass}>
        Generate free
      </a>
    </div>
  );
}
