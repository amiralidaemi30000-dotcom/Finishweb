import { colorFor, initials } from '../lib/format'

// Online users get a slowly-rotating saffron→rose gradient ring.
export default function Avatar({ name, src, size = 48, online = false, ring = false }) {
  const color = colorFor(name || '')
  const pad = online || ring ? 3 : 0
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {(online || ring) && (
        <div
          className="absolute inset-0 rounded-full animate-spin-slow"
          style={{ background: 'conic-gradient(from 0deg, #C9792A, #8B1A4A, #F0B429, #C9792A)' }}
        />
      )}
      <div
        className="absolute overflow-hidden rounded-full"
        style={{ inset: pad }}
      >
        <div
          className="flex h-full w-full items-center justify-center font-semibold"
          style={{
            background: src ? undefined : `linear-gradient(135deg, ${color}, ${color}cc)`,
            fontSize: size * 0.36,
          }}
        >
          {src ? (
            <img src={src} alt={name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-cream">{initials(name)}</span>
          )}
        </div>
      </div>
      {online && (
        <span
          className="absolute bottom-0 end-0 z-10 block rounded-full border-2 border-ink bg-trust"
          style={{ width: size * 0.26, height: size * 0.26 }}
        />
      )}
    </div>
  )
}
