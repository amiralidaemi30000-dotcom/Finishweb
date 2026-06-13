// The HAMIK logo mark — an inline SVG so it always renders crisply, no asset needed.
export function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="HAMIK">
      <defs>
        <linearGradient id="hamik-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F8EF7" />
          <stop offset="1" stopColor="#F0B429" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0A0E1A" stroke="url(#hamik-g)" strokeWidth="2" />
      <path
        d="M22 18v28M42 18v28M22 32h20"
        stroke="url(#hamik-g)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Wordmark({ className = '' }) {
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-white">HAM</span>
      <span className="bg-gradient-to-l from-primary to-gold bg-clip-text text-transparent">IK</span>
    </span>
  )
}
