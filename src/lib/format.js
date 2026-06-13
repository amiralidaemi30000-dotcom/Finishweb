// Lightweight, dependency-free time helpers with Persian + English output.

const fa = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' })

export function formatTime(iso) {
  if (!iso) return ''
  try {
    return fa.format(new Date(iso))
  } catch {
    return ''
  }
}

export function formatRelative(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  const diff = (now - d) / 1000
  if (diff < 60) return 'اکنون'
  if (diff < 3600) return `${Math.floor(diff / 60)} دقیقه پیش`
  if (diff < 86400) return formatTime(iso)
  if (diff < 172800) return 'دیروز'
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(d)
}

// Stable accent color per user id, drawn from the warm Persian palette.
const PALETTE = ['#C9792A', '#8B1A4A', '#B5683A', '#7A2A52', '#D08A3A', '#A33A5E']
export function colorFor(id = '') {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '؟'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}
