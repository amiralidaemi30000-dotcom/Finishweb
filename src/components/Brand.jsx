// The HAMIK logo mark — saffron → rose, inline SVG so it always renders crisply.
export function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="HAMIK">
      <defs>
        <linearGradient id="hamik-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C9792A" />
          <stop offset="1" stopColor="#8B1A4A" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0D0A0E" stroke="url(#hamik-g)" strokeWidth="2" />
      <path
        d="M22 18v28M42 18v28M22 32h20"
        stroke="url(#hamik-g)"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Wordmark with a subtle gold shimmer sweeping across it.
export function Wordmark({ className = '', shimmer = false }) {
  if (shimmer) {
    return <span className={`shimmer-gold font-extrabold tracking-tight ${className}`}>HAMIK</span>
  }
  return (
    <span className={`font-extrabold tracking-tight ${className}`}>
      <span className="text-cream">HAM</span>
      <span className="bg-gradient-to-l from-saffron to-rose bg-clip-text text-transparent">IK</span>
    </span>
  )
}
