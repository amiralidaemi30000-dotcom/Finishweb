import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, Plus, X, Loader2, MessageCircle } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { loadConversations, searchUsers, startDirectConversation } from '../lib/api'
import { formatRelative } from '../lib/format'
import Avatar from '../components/Avatar'
import { Wordmark } from '../components/Brand'

// Honest unread tracking: remember when each chat was last opened.
const seenKey = (id) => `hamik:seen:${id}`
const lastSeen = (id) => Number(localStorage.getItem(seenKey(id)) || 0)
export const markSeen = (id) => localStorage.setItem(seenKey(id), String(Date.now()))

const tap = { scale: 0.95 }

export default function ChatList() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [composing, setComposing] = useState(false)

  const refresh = useCallback(async () => {
    try {
      setConversations(await loadConversations(user.id))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const channel = supabase
      .channel('chat-list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => refresh())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'conversation_participants' }, () => refresh())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [refresh])

  const visible = conversations.filter((c) =>
    c.title?.toLowerCase().includes(filter.trim().toLowerCase()),
  )

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="flex h-full flex-col"
    >
      <header className="glass-strong z-20 px-5 pb-4 pt-6">
        <div className="flex items-center justify-between">
          <Wordmark shimmer className="text-2xl" />
          <motion.button
            whileTap={tap}
            onClick={() => navigate('/me')}
            className="rounded-full"
            aria-label="پروفایل"
          >
            <Avatar name={profile?.display_name || user.email} src={profile?.avatar_url} size={38} ring />
          </motion.button>
        </div>

        <div className="relative mt-4">
          <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-cream/35" />
          <input
            className="input-glass ps-11 font-fa"
            placeholder="جستجو در گفتگوها"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-3 pb-24 pt-3">
        {loading ? (
          <ListSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState onStart={() => setComposing(true)} hasAny={conversations.length > 0} />
        ) : (
          visible.map((c, i) => {
            const unread =
              c.lastMessage &&
              c.lastMessage.sender_id !== user.id &&
              new Date(c.lastMessage.created_at).getTime() > lastSeen(c.id)
            return (
              <motion.button
                key={c.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30, delay: Math.min(i * 0.04, 0.3) }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/c/${c.id}`)}
                className="mb-1.5 flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-start transition hover:border-cream/[0.06] hover:bg-cream/[0.04]"
              >
                <Avatar name={c.title} src={c.avatar} size={54} online={i < 2} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-fa text-[15px] font-semibold text-cream">{c.title}</span>
                    <span className="shrink-0 font-fa text-[11px] text-cream/35">
                      {c.lastMessage ? formatRelative(c.lastMessage.created_at) : ''}
                    </span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className={`truncate font-fa text-[13px] ${unread ? 'text-cream/80' : 'text-cream/45'}`}>
                      {c.lastMessage
                        ? (c.lastMessage.sender_id === user.id ? 'شما: ' : '') + c.lastMessage.content
                        : 'گفتگو را شروع کنید'}
                    </p>
                    {unread && <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-saffron shadow-glow-saffron" />}
                  </div>
                </div>
              </motion.button>
            )
          })
        )}
      </div>

      <motion.button
        whileTap={tap}
        onClick={() => setComposing(true)}
        className="grad-saffron-rose absolute bottom-6 end-6 z-20 flex h-14 w-14 items-center justify-center rounded-2xl shadow-glow-saffron"
        aria-label="گفتگوی جدید"
      >
        <Plus size={26} className="text-cream" />
      </motion.button>

      {composing && <NewChatSheet onClose={() => setComposing(false)} />}
    </motion.div>
  )
}

function NewChatSheet({ onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [starting, setStarting] = useState(null)
  const debounce = useRef()

  useEffect(() => {
    clearTimeout(debounce.current)
    if (!term.trim()) {
      setResults([])
      return
    }
    setSearching(true)
    debounce.current = setTimeout(async () => {
      try {
        setResults(await searchUsers(term, user.id))
      } catch (e) {
        console.error(e)
      } finally {
        setSearching(false)
      }
    }, 280)
    return () => clearTimeout(debounce.current)
  }, [term, user.id])

  async function start(other) {
    setStarting(other.id)
    try {
      const convId = await startDirectConversation(other.id)
      onClose()
      navigate(`/c/${convId}`)
    } catch (e) {
      console.error(e)
      setStarting(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex flex-col bg-ink/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-strong mt-auto flex max-h-[80%] flex-col rounded-t-3xl p-5"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-fa text-lg font-bold text-cream">گفتگوی جدید</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-cream/50 hover:bg-cream/5">
            <X size={20} />
          </button>
        </div>

        <div className="relative">
          <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-cream/35" />
          <input
            autoFocus
            className="input-glass ps-11 font-fa"
            placeholder="نام یا نام کاربری را بنویسید"
            value={term}
            onChange={(e) => setTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {searching && (
            <div className="flex justify-center py-8 text-cream/40">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {!searching && term.trim() && results.length === 0 && (
            <p className="py-8 text-center font-fa text-sm text-cream/40">کاربری پیدا نشد.</p>
          )}
          {results.map((p) => (
            <motion.button
              key={p.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => start(p)}
              disabled={starting === p.id}
              className="flex w-full items-center gap-3 rounded-2xl px-2 py-2.5 text-start transition hover:bg-cream/5"
            >
              <Avatar name={p.display_name} src={p.avatar_url} size={46} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-fa text-[15px] font-semibold text-cream">{p.display_name}</p>
                <p className="truncate text-[12px] text-rose-soft" dir="ltr">
                  @{p.username}
                </p>
              </div>
              {starting === p.id && <Loader2 size={18} className="animate-spin text-saffron" />}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function ListSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {[...Array(7)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-1 py-3">
          <div className="h-[54px] w-[54px] animate-pulse rounded-full bg-cream/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 animate-pulse rounded bg-cream/5" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-cream/[0.03]" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onStart, hasAny }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 text-center">
      <div className="glass mb-4 flex h-20 w-20 items-center justify-center rounded-3xl">
        <MessageCircle size={34} className="text-saffron" />
      </div>
      <p className="font-fa text-lg font-bold text-cream">{hasAny ? 'چیزی پیدا نشد' : 'هنوز گفتگویی نیست'}</p>
      <p className="mt-2 font-fa text-sm leading-7 text-cream/45">
        {hasAny ? 'عبارت دیگری را امتحان کنید.' : 'اولین گفتگوی خود را شروع کنید و با دوستانتان در هامیک حرف بزنید.'}
      </p>
      {!hasAny && (
        <motion.button whileTap={tap} onClick={onStart} className="btn-primary mt-6 w-auto px-8 font-fa">
          شروع گفتگو
        </motion.button>
      )}
    </div>
  )
}
