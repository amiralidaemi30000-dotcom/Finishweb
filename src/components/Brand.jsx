// The Javid Nam logo mark — gold ج‌ن letters on a dark lapis circle. Clean, minimal, premium.
export function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-label="جاوید نام">
      <circle cx="32" cy="32" r="30" fill="#1A3A6B" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="26" fill="none" stroke="#D4AF37" strokeOpacity="0.25" strokeWidth="0.75" />
      <text
        x="32"
        y="43"
        textAnchor="middle"
        fontFamily="Vazirmatn, Inter, sans-serif"
        fontWeight="700"
        fontSize="30"
        fill="#D4AF37"
      >
        جن
      </text>
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
