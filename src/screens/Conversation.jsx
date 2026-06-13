import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Send, Phone, Video } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { loadMessages, sendMessage, loadConversationContext } from '../lib/api'
import { formatTime } from '../lib/format'
import Avatar from '../components/Avatar'

export default function Conversation() {
  const { conversationId } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [other, setOther] = useState(null)
  const [loading, setLoading] = useState(true)
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)
  const endRef = useRef(null)

  const scrollToBottom = useCallback((smooth = true) => {
    requestAnimationFrame(() =>
      endRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' }),
    )
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
      })
      .catch((e) => {
        console.error(e)
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [conversationId, user.id, scrollToBottom])

  // Real-time: append new messages for this conversation as they land.
  useEffect(() => {
    const channel = supabase
      .channel(`conv-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          scrollToBottom()
        },
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [conversationId, scrollToBottom])

  async function handleSend(e) {
    e.preventDefault()
    const content = draft.trim()
    if (!content || sending) return
    setDraft('')
    setSending(true)

    // Optimistic bubble for instant feel.
    const tempId = `temp-${Date.now()}`
    const optimistic = {
      id: tempId,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      pending: true,
    }
    setMessages((prev) => [...prev, optimistic])
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
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col"
    >
      {/* Header */}
      <header className="glass-strong z-20 flex items-center gap-3 px-3 py-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-full p-2 text-white/70 transition hover:bg-white/5 active:scale-90"
          aria-label="بازگشت"
        >
          <ArrowRight size={22} />
        </button>
        <Avatar name={title} src={other?.avatar_url} size={42} online />
        <div className="min-w-0 flex-1">
          <p className="truncate font-fa text-[15px] font-semibold text-white">{title}</p>
          <p className="font-fa text-[12px] text-emerald-400/80">آنلاین</p>
        </div>
        <button className="rounded-full p-2 text-white/50 transition hover:bg-white/5" aria-label="تماس صوتی">
          <Phone size={19} />
        </button>
        <button className="rounded-full p-2 text-white/50 transition hover:bg-white/5" aria-label="تماس تصویری">
          <Video size={19} />
        </button>
      </header>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="relative flex-1 space-y-1.5 overflow-y-auto px-4 py-4"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 10%, rgba(79,142,247,0.06), transparent 40%), radial-gradient(circle at 85% 90%, rgba(240,180,41,0.05), transparent 40%)',
        }}
      >
        {loading ? (
          <div className="space-y-3 pt-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`h-9 animate-pulse rounded-2xl bg-white/[0.04] ${
                  i % 2 ? 'ms-auto w-1/2' : 'w-2/3'
                }`}
              />
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-2xl glass px-5 py-3 font-fa text-sm text-white/50">
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
                  initial={{ opacity: 0, y: 6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.18 }}
                  className={`flex ${mine ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[78%] rounded-2xl px-3.5 py-2 font-fa text-[14px] leading-6 shadow-sm ${
                      mine
                        ? 'bg-gradient-to-br from-primary to-[#4178d6] text-white'
                        : 'glass text-white/90'
                    } ${grouped ? 'mt-0.5' : 'mt-2'} ${
                      mine ? 'rounded-bl-md' : 'rounded-br-md'
                    } ${m.pending ? 'opacity-70' : ''}`}
                  >
                    <span className="whitespace-pre-wrap break-words">{m.content}</span>
                    <span
                      className={`mr-2 inline-block translate-y-0.5 text-[10px] ${
                        mine ? 'text-white/60' : 'text-white/35'
                      }`}
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
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <form onSubmit={handleSend} className="glass-strong z-20 flex items-center gap-2 px-3 py-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="input-glass font-fa"
          placeholder="پیام بنویسید…"
          dir="auto"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#6FA3FF] text-white shadow-glow transition active:scale-90 disabled:opacity-40"
          aria-label="ارسال"
        >
          <Send size={20} className="-scale-x-100" />
        </button>
      </form>
    </motion.div>
  )
}
