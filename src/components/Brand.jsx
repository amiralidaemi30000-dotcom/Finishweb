// The HAMIK logo mark — gold H on lapis midnight, inline SVG (always crisp).
export function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="HAMIK">
      <defs>
        <linearGradient id="hamik-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#F0D060" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0E1626" stroke="url(#hamik-g)" strokeWidth="2" />
      <path d="M22 18v28M42 18v28M22 32h20" stroke="url(#hamik-g)" strokeWidth="5" strokeLinecap="round" />
    </svg>
  )
}

// Wordmark — gold with a slow candlelight shimmer.
export function Wordmark({ className = '', shimmer = false }) {
  if (shimmer) {
    return <span className={`shimmer-gold font-extrabold tracking-tight ${className}`}>HAMIK</span>
  }
  return (
    <span className={`font-extrabold tracking-tight text-gold ${className}`}>HAMIK</span>
  )
}
