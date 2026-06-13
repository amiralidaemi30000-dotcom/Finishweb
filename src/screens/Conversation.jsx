import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Send, Phone, Video, Lock, Unlock } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { loadMessages, sendMessage, loadConversationContext } from '../lib/api'
import { formatTime } from '../lib/format'
import Avatar from '../components/Avatar'
import { markSeen } from './ChatList'

export default function Conversation() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [other, setOther] = useState(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [focused, setFocused] = useState(false)
  const [othersTyping, setOthersTyping] = useState(false)
  const [locked, setLocked] = useState(false) // drives the unlock→lock intro
  const channelRef = useRef(null)
  const endRef = useRef(null)
  const typingTimeout = useRef()

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' }))
  }, [])

  // Intro: lock clicks shut after a beat.
  useEffect(() => {
    const t = setTimeout(() => setLocked(true), 480)
    return () => clearTimeout(t)
  }, [conversationId])

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([loadMessages(conversationId), loadConversationContext(conversationId, user.id)])
      .then(([msgs, ctx]) => {
        if (!active) return
        setMessages(msgs)
        setOther(ctx.other)
        setLoading(false)
        scrollToBottom(false)
        markSeen(conversationId)
      })
      .catch((e) => {
        console.error(e)
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [conversationId, user.id, scrollToBottom])

  // Realtime: new messages + live typing presence via broadcast.
  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversationId}`, { config: { broadcast: { self: false } } })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => (prev.some((m) => m.id === payload.new.id) ? prev : [...prev, payload.new]))
          markSeen(conversationId)
          scrollToBottom()
        },
      )
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.userId === user.id) return
        setOthersTyping(true)
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setOthersTyping(false), 2500)
      })
      .subscribe()
    channelRef.current = channel
    return () => {
      clearTimeout(typingTimeout.current)
      supabase.removeChannel(channel)
    }
  }, [conversationId, user.id, scrollToBottom])

  function onDraftChange(e) {
    setDraft(e.target.value)
    channelRef.current?.send({ type: 'broadcast', event: 'typing', payload: { userId: user.id } })
  }

  async function handleSend(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setDraft('')
    setSending(true)

    const tempId = `temp-${Date.now()}`
    setMessages((prev) => [
      ...prev,
      { id: tempId, conversation_id: conversationId, sender_id: user.id, content, created_at: new Date().toISOString(), pending: true },
    ])
    scrollToBottom()

    try {
      const saved = await sendMessage(conversationId, user.id, content)
      setMessages((prev) => prev.map((m) => (m.id === tempId ? saved : m)))
    } catch (err) {
      console.error(err)
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
      setDraft(content)
    } finally {
      setSending(false)
    }
  }

  const title = other?.display_name || 'گفتگو'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full flex-col"
    >
      {/* Header (no motion — navigation chrome) */}
      <header className="glass-strong z-20 flex items-center gap-3 px-3 py-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-full p-2 text-cream/70 transition hover:bg-cream/5 active:scale-90"
          aria-label="بازگشت"
        >
          <ArrowRight size={22} />
        </button>
        <Avatar name={title} src={other?.avatar_url} size={42} online />
        <div className="min-w-0 flex-1">
          <p className="truncate font-fa text-[15px] font-semibold text-cream">{title}</p>
          <p className="font-fa text-[12px] text-trust/90">{othersTyping ? 'در حال نوشتن…' : 'آنلاین'}</p>
        </div>
        <button className="rounded-full p-2 text-cream/50 transition hover:bg-cream/5" aria-label="تماس صوتی">
          <Phone size={19} />
        </button>
        <button className="rounded-full p-2 text-cream/50 transition hover:bg-cream/5" aria-label="تماس تصویری">
          <Video size={19} />
        </button>
      </header>

      {/* Messages over a faint Persian geometric pattern */}
      <div className="relative flex-1 overflow-hidden">
        <div className="persian-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative h-full space-y-1.5 overflow-y-auto px-4 py-4">
          {/* Encryption indicator with unlock→lock intro */}
          <div className="mb-3 flex justify-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-3 py-1.5">
              <AnimatePresence mode="wait" initial={false}>
                {locked ? (
                  <motion.span
                    key="locked"
                    initial={{ scale: 0.6, rotate: -12 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 16 }}
                  >
                    <Lock size={13} className="text-trust" />
                  </motion.span>
                ) : (
                  <motion.span key="unlocked" exit={{ opacity: 0 }}>
                    <Unlock size={13} className="text-trust" />
                  </motion.span>
                )}
              </AnimatePresence>
              <span className="font-fa text-[12px] text-trust">این مکالمه رمزگذاری شده است</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-9 animate-pulse rounded-2xl bg-cream/[0.04] ${i % 2 ? 'ms-auto w-1/2' : 'w-2/3'}`} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-3/4 flex-col items-center justify-center text-center">
              <div className="glass rounded-2xl px-5 py-3 font-fa text-sm text-cream/55">
                این ابتدای گفتگوی شماست. سلام کنید 👋
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m, i) => {
                const mine = m.sender_id === user.id
                const prev = messages[i - 1]
                const grouped = prev && prev.sender_id === m.sender_id
                return (
                  <motion.div
                    key={m.id}
                    initial={mine ? { opacity: 0, scale: 0.8 } : { opacity: 0, x: -24 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={
                      mine
                        ? { type: 'spring', stiffness: 520, damping: 20, duration: 0.2 }
                        : { duration: 0.25, ease: 'easeOut' }
                    }
                    className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 font-fa text-[14px] leading-6 ${
                        mine
                          ? 'grad-saffron-rose rounded-2xl rounded-bl-md text-cream shadow-glow-saffron'
                          : 'glass rounded-2xl rounded-br-md text-cream/90'
                      } ${grouped ? 'mt-0.5' : 'mt-2'} ${m.pending ? 'opacity-70' : ''}`}
                    >
                      <span className="whitespace-pre-wrap break-words">{m.content}</span>
                      <span
                        className={`mr-2 inline-block translate-y-0.5 text-[10px] ${mine ? 'text-cream/70' : 'text-cream/35'}`}
                        dir="ltr"
                      >
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* Breathing typing indicator */}
          <AnimatePresence>
            {othersTyping && (
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="flex justify-end"
              >
                <div className="glass mt-2 flex items-center gap-1.5 rounded-2xl rounded-br-md px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-2 w-2 rounded-full bg-cream/70 animate-breathe"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Composer — glowing border when typing */}
      <form onSubmit={handleSend} className="glass-strong z-20 flex items-center gap-2 px-3 py-3">
        <input
          value={draft}
          onChange={onDraftChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-2xl border bg-cream/[0.05] px-4 py-3 font-fa text-[15px] text-cream placeholder-cream/35 outline-none transition ${
            focused ? 'border-saffron/60 shadow-glow-saffron' : 'border-cream/10'
          }`}
          placeholder="پیام بنویسید…"
          dir="auto"
        />
        <motion.button
          type="submit"
          disabled={!draft.trim()}
          whileTap={{ scale: 0.9 }}
          className="grad-saffron-rose flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-cream shadow-glow-saffron transition disabled:opacity-40"
          aria-label="ارسال"
        >
          <Send size={20} className="-scale-x-100" />
        </motion.button>
      </form>
    </motion.div>
  )
}
