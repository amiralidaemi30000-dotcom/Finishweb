// The Javid Nam logo mark — gold J monogram on lapis midnight, inline SVG.
export function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="Javid Nam">
      <defs>
        <linearGradient id="jn-g" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#D4AF37" />
          <stop offset="1" stopColor="#F0D060" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="#0E1626" stroke="url(#jn-g)" strokeWidth="2" />
      <path
        d="M26 19 H46 M40 19 V40 C40 49 30 50.5 25.5 43"
        stroke="url(#jn-g)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Wordmark — gold with a slow candlelight shimmer.
export function Wordmark({ className = '', shimmer = false }) {
  if (shimmer) {
    return <span className={`shimmer-gold font-extrabold tracking-tight ${className}`}>Javid Nam</span>
  }
  return <span className={`font-extrabold tracking-tight text-gold ${className}`}>Javid Nam</span>
}
