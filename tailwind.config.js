/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0D0A0E',          // deep warm Persian night
        'ink-soft': '#1A1216',   // raised warm surface
        saffron: '#C9792A',      // زعفران — primary
        primary: '#C9792A',      // alias so existing classes read saffron
        rose: '#8B1A4A',         // رنگ گل — deep rose secondary
        'rose-soft': '#C77FA0',  // muted rose for secondary text
        cream: '#F5EFE6',        // warm cream text (never cold white)
        trust: '#2ECC71',        // encryption / security only
        gold: '#F0B429',         // premium moments only
      },
      fontFamily: {
        sans: ['Inter', 'Vazirmatn', 'system-ui', 'sans-serif'],
        fa: ['Vazirmatn', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.45)',
        'glow-saffron': '0 6px 22px rgba(201, 121, 42, 0.40)',
        'glow-rose': '0 6px 22px rgba(139, 26, 74, 0.40)',
        'glow-gold': '0 0 28px rgba(240, 180, 41, 0.45)',
      },
      keyframes: {
        // breathing typing dots — like a slow heartbeat
        breathe: {
          '0%, 100%': { opacity: '0.25', transform: 'translateY(0)' },
          '50%': { opacity: '1', transform: 'translateY(-2px)' },
        },
        // slow saffron→rose ring rotation behind online avatars
        spinSlow: { to: { transform: 'rotate(360deg)' } },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        breathe: 'breathe 1.4s ease-in-out infinite',
        'spin-slow': 'spinSlow 3s linear infinite',
        shimmer: 'shimmer 4s linear infinite',
      },
    },
  },
  plugins: [],
}
