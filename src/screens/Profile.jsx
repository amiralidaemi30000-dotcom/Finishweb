import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut, Check, Loader2, Shield, Bell, Palette, Globe, AtSign } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'

const faNum = (n) => new Intl.NumberFormat('fa-IR').format(n ?? 0)

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.display_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [stats, setStats] = useState({ messages: 0, connections: 0 })

  useEffect(() => {
    let active = true
    Promise.all([
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', user.id),
      supabase.from('conversation_participants').select('conversation_id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([m, c]) => {
      if (active) setStats({ messages: m.count || 0, connections: c.count || 0 })
    })
    return () => {
      active = false
    }
  }, [user.id])

  async function save() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim(), username: username.trim().replace(/^@/, ''), bio: bio.trim() })
      .eq('id', user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const joinYear = profile?.created_at
    ? new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date(profile.created_at))
    : '۱۴۰۴'

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="flex h-full flex-col overflow-y-auto"
    >
      {/* Gradient banner (no motion — it's chrome) */}
      <div className="relative h-44 shrink-0 bg-gradient-to-b from-saffron to-rose">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-2xl" />
        <button
          onClick={() => navigate('/')}
          className="absolute end-3 top-5 rounded-full p-2 text-cream/90 transition hover:bg-black/10 active:scale-90"
          aria-label="بازگشت"
        >
          <ArrowRight size={22} />
        </button>
      </div>

      <div className="-mt-14 px-5 pb-12">
        {/* Glowing avatar — gentle zoom on tap */}
        <div className="flex flex-col items-center">
          <motion.div whileTap={{ scale: 1.06 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }}>
            <Avatar name={name || user.email} src={profile?.avatar_url} size={108} ring />
          </motion.div>
          <p className="mt-3 font-fa text-xl font-bold text-cream">{name || 'کاربر هامیک'}</p>
          <p className="mt-1 font-fa text-[14px] text-rose-soft" dir="ltr">
            @{username || 'hamik'}
          </p>
        </div>

        {/* Real stats */}
        <div className="glass mt-5 grid grid-cols-3 rounded-2xl py-3">
          <Stat value={faNum(stats.messages)} label="پیام" divider />
          <Stat value={faNum(stats.connections)} label="ارتباط" divider />
          <Stat value={joinYear} label="عضویت" />
        </div>

        {/* Editable fields */}
        <div className="mt-6 space-y-4">
          <Labeled label="نام نمایشی">
            <input className="input-glass font-fa" value={name} onChange={(e) => setName(e.target.value)} />
          </Labeled>
          <Labeled label="نام کاربری">
            <div className="relative">
              <AtSign size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-cream/35" />
              <input dir="ltr" className="input-glass ps-11 text-start" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </Labeled>
          <Labeled label="درباره من">
            <textarea
              rows={3}
              className="input-glass resize-none font-fa"
              placeholder="چند کلمه درباره خودتان…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </Labeled>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={save}
            disabled={saving}
            className="btn-primary flex items-center justify-center gap-2 font-fa"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : null}
            {saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
          </motion.button>
        </div>

        {/* Settings as glass cards */}
        <div className="mt-7 space-y-2.5">
          <SettingCard icon={Shield} color="text-trust" bg="bg-trust/15" label="حریم خصوصی و امنیت" hint="رمزگذاری سرتاسری" />
          <SettingCard icon={Bell} color="text-saffron" bg="bg-saffron/15" label="اعلان‌ها" />
          <SettingCard icon={Palette} color="text-gold" bg="bg-gold/15" label="ظاهر و تم" hint="تیره" />
          <SettingCard icon={Globe} color="text-rose-soft" bg="bg-rose/25" label="زبان" hint="فارسی" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            await signOut()
            navigate('/login', { replace: true })
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-rose to-[#5E1234] py-3.5 font-fa font-semibold text-cream shadow-glow-rose"
        >
          <LogOut size={18} />
          خروج از حساب
        </motion.button>

        <p className="mt-8 text-center font-fa text-[12px] text-cream/25">
          HAMIK · نسخه ۲.۰ · ساخته‌شده با ❤️ برای ایرانیان
        </p>
      </div>
    </motion.div>
  )
}

function Stat({ value, label, divider }) {
  return (
    <div className={`flex flex-col items-center ${divider ? 'border-e border-cream/10' : ''}`}>
      <span className="font-fa text-lg font-bold text-saffron">{value}</span>
      <span className="font-fa text-[12px] text-cream/55">{label}</span>
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-fa text-[13px] text-cream/45">{label}</label>
      {children}
    </div>
  )
}

function SettingCard({ icon: Icon, color, bg, label, hint }) {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="glass flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-start transition hover:bg-cream/[0.08]"
    >
      <span className={`flex h-9 w-9 items-center justify-center rounded-full ${bg}`}>
        <Icon size={18} className={color} />
      </span>
      <span className="flex-1 font-fa text-[14px] text-cream/90">{label}</span>
      {hint && <span className="font-fa text-[12px] text-cream/35">{hint}</span>}
    </motion.button>
  )
}
