import { colorFor, initials } from '../lib/format'

export default function Avatar({ name, src, size = 48, online = false, ring = false }) {
  const color = colorFor(name || '')
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`flex h-full w-full items-center justify-center overflow-hidden rounded-full font-semibold ${
          ring ? 'ring-2 ring-primary/50' : ''
        }`}
        style={{
          background: src ? undefined : `linear-gradient(135deg, ${color}, ${color}99)`,
          fontSize: size * 0.36,
        }}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-white/95">{initials(name)}</span>
        )}
      </div>
      {online && (
        <span
          className="absolute bottom-0 end-0 block rounded-full border-2 border-ink bg-emerald-400"
          style={{ width: size * 0.28, height: size * 0.28 }}
        />
      )}
    </div>
  )
}
