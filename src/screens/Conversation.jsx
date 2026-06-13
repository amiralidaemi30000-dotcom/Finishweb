import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Send, Phone, Video, Lock } from 'lucide-react'
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
  const [ripple, setRipple] = useState(0)
  const channelRef = useRef(null)
  const endRef = useRef(null)
  const typingTimeout = useRef()

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' }))
  }, [])

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
    setRipple((r) => r + 1) // gold ripple from send button

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
      initial={{ opacity: 0, rotateX: -12, scaleY: 0.94 }}
      animate={{ opacity: 1, rotateX: 0, scaleY: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{ transformOrigin: 'top', transformPerspective: 1200 }}
      className="flex h-full flex-col"
    >
      {/* Header — glass blur, faint gold hairline */}
      <header className="z-20 flex items-center gap-3 border-b border-gold/[0.08] bg-lapis/15 px-3 py-3 backdrop-blur-2xl">
        <button onClick={() => navigate('/')} className="rounded-full p-2 text-pearl/70 transition hover:bg-pearl/5 active:scale-90" aria-label="بازگشت">
          <ArrowRight size={22} />
        </button>
        <Avatar name={title} src={other?.avatar_url} size={42} online />
        <div className="min-w-0 flex-1">
          <p className="truncate font-fa text-[15px] font-semibold text-pearl">{title}</p>
          <p className="font-fa text-[12px] text-trust/90">{othersTyping ? 'در حال نوشتن…' : 'آنلاین'}</p>
        </div>
        <button className="rounded-full p-2 text-pearl/50 transition hover:bg-pearl/5" aria-label="تماس صوتی"><Phone size={19} /></button>
        <button className="rounded-full p-2 text-pearl/50 transition hover:bg-pearl/5" aria-label="تماس تصویری"><Video size={19} /></button>
      </header>

      {/* Messages over the mosque pattern, with a soft lapis vignette */}
      <div className="relative flex-1 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_120px_30px_rgba(8,11,20,0.9)]" />
        <div className="relative h-full space-y-1.5 overflow-y-auto px-4 py-4">
          {/* permanent encryption indicator */}
          <div className="mb-3 flex justify-center">
            <div className="relative inline-flex items-center gap-1.5 rounded-full border border-trust/30 bg-lapis/15 px-3 py-1.5">
              <span className="absolute -inset-1 rounded-full bg-trust/15 blur-md" />
              <Lock size={12} className="relative text-gold" />
              <span className="relative font-fa text-[11px] text-trust">این مکالمه رمزگذاری شده است</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3 pt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`skeleton h-10 rounded-2xl ${i % 2 ? 'ms-auto w-1/2' : 'w-2/3'}`} style={{ animationDelay: `${i * 0.12}s` }} />
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-3/4 flex-col items-center justify-center text-center">
              <div className="glass rounded-2xl px-5 py-3 font-fa text-sm text-pearl/55">این ابتدای گفتگوی شماست. سلام کنید 👋</div>
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
                    initial={mine ? { opacity: 0, scale: 0.85 } : { opacity: 0, x: -24, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    transition={{ type: 'spring', stiffness: 480, damping: 22 }}
                    className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 font-fa text-[14px] leading-6 text-pearl ${
                        mine ? 'bubble-sent' : 'bubble-received'
                      } ${grouped ? 'mt-0.5' : 'mt-2'} ${m.pending ? 'opacity-70' : ''}`}
                    >
                      <span className="whitespace-pre-wrap break-words">{m.content}</span>
                      <span className={`mr-2 inline-block translate-y-0.5 text-[10px] ${mine ? 'text-pearl/65' : 'text-pearl/35'}`} dir="ltr">
                        {formatTime(m.created_at)}
                      </span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}

          {/* breathing gold typing dots */}
          <AnimatePresence>
            {othersTyping && (
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className="flex justify-end">
                <div className="bubble-received mt-2 flex items-center gap-1.5 px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span key={i} className="h-2 w-2 rounded-full bg-gold animate-breathe" style={{ animationDelay: `${i * 0.2}s` }} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={endRef} />
        </div>
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="z-20 flex items-center gap-2 border-t border-gold/[0.08] bg-lapis/15 px-3 py-3 backdrop-blur-2xl">
        <input
          value={draft}
          onChange={onDraftChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={`w-full rounded-2xl border bg-lapis/15 px-4 py-3 font-fa text-[15px] text-pearl placeholder-pearl/40 outline-none transition ${
            focused ? 'border-gold/60 shadow-glow-gold' : 'border-gold/20'
          }`}
          placeholder="پیام بنویسید…"
          dir="auto"
        />
        <motion.button
          type="submit"
          disabled={!draft.trim()}
          whileTap={{ scale: 0.9 }}
          className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gold shadow-glow-gold transition disabled:opacity-40"
          aria-label="ارسال"
        >
          {/* gold ripple from center on press */}
          <AnimatePresence>
            {ripple > 0 && (
              <motion.span
                key={ripple}
                initial={{ scale: 0, opacity: 0.6 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="absolute h-8 w-8 rounded-full bg-goldglow"
              />
            )}
          </AnimatePresence>
          <Send size={20} className="relative -scale-x-100 text-base" />
        </motion.button>
      </form>
    </motion.div>
  )
}
