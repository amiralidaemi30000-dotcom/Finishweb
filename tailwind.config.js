/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: '#080B14',        // deepest midnight
        ink: '#080B14',         // alias
        lapis: '#1A3A6B',       // Persian mosque blue
        lapisL: '#2952A3',      // royal blue glow
        gold: '#D4AF37',        // real gold
        goldglow: '#F0D060',    // shimmer only
        pearl: '#F0EBE1',       // warm ivory text
        crimson: '#7B1C1C',     // alerts only
        trust: '#1DB954',       // encryption green
      },
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
        fa: ['Vazirmatn', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.5)',
        sent: '0 4px 20px rgba(26, 58, 107, 0.5)',
        'glow-gold': '0 0 30px rgba(212, 175, 55, 0.30)',
        'glow-lapis': '0 0 28px rgba(41, 82, 163, 0.35)',
      },
      keyframes: {
        // candlelight on a mosque tile — gold sweep
        candle: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
        // breathing typing dots — a slow heartbeat
        breathe: { '0%, 100%': { transform: 'scale(0.6)', opacity: '0.4' }, '50%': { transform: 'scale(1)', opacity: '1' } },
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        // skeleton shimmer, right→left for RTL
        skeleton: { '0%': { backgroundPosition: '200% 0' }, '100%': { backgroundPosition: '-200% 0' } },
      },
      animation: {
        candle: 'candle 4s linear infinite',
        breathe: 'breathe 1.4s ease-in-out infinite',
        'spin-slow': 'spinSlow 3s linear infinite',
        skeleton: 'skeleton 1.8s linear infinite',
      },
    },
  },
  plugins: [],
}
