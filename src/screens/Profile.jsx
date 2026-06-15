import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut, Check, Shield, Bell, Palette, Globe, AtSign } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'

const faNum = (n) => new Intl.NumberFormat('fa-IR').format(n ?? 0)
const page = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

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
    <motion.div {...page} className="flex h-full flex-col overflow-y-auto">
      {/* subtle banner: midnight with a faint lapis breath, gold hairline base */}
      <div className="relative h-36 shrink-0 bg-gradient-to-l from-base via-lapis/30 to-base">
        <div className="absolute inset-x-0 bottom-0 h-px bg-gold/30" />
        <button onClick={() => navigate('/')} className="absolute end-3 top-5 rounded-full p-2 text-pearl/90 transition hover:bg-black/20 active:scale-90" aria-label="بازگشت">
          <ArrowRight size={22} />
        </button>
      </div>

      <div className="-mt-12 px-5 pb-12">
        <div className="flex flex-col items-center">
          <motion.div whileTap={{ scale: 1.06 }} transition={{ type: 'spring', stiffness: 300, damping: 15 }} className="drop-shadow-[0_0_30px_rgba(212,175,55,0.3)]">
            <Avatar name={name || user.phone || user.email} src={profile?.avatar_url} size={90} ring />
          </motion.div>
          <p className="mt-3 font-fa text-[22px] font-bold text-gold">{name || 'کاربر جاوید نام'}</p>
          <p className="mt-1 font-fa text-[14px] text-pearl/60" dir="ltr">@{username || 'javidnam'}</p>
        </div>

        {/* real stats */}
        <div className="mt-5 grid grid-cols-3 gap-2">
          <Stat value={faNum(stats.messages)} label="پیام" />
          <Stat value={faNum(stats.connections)} label="مخاطب" />
          <Stat value={joinYear} label="عضویت" />
        </div>

        <div className="mt-6 space-y-4">
          <Labeled label="نام نمایشی">
            <input className="input-glass font-fa" value={name} onChange={(e) => setName(e.target.value)} />
          </Labeled>
          <Labeled label="نام کاربری">
            <div className="relative">
              <AtSign size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-pearl/40" />
              <input dir="ltr" className="input-glass ps-11 text-start" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </Labeled>
          <Labeled label="درباره من">
            <textarea rows={3} className="input-glass resize-none font-fa" placeholder="چند کلمه درباره خودتان…" value={bio} onChange={(e) => setBio(e.target.value)} />
          </Labeled>

          <motion.button whileTap={{ scale: 0.95 }} onClick={save} disabled={saving} className="btn-gold flex items-center justify-center gap-2 font-fa text-base">
            {saved && <Check size={18} className="text-base" />}
            <span className="text-base">{saving ? 'در حال ذخیره…' : saved ? 'ذخیره شد' : 'ذخیره تغییرات'}</span>
          </motion.button>
        </div>

        <div className="mt-7 space-y-2.5">
          <SettingCard icon={Shield} dot="bg-trust" label="حریم خصوصی و امنیت" hint="رمزگذاری سرتاسری" />
          <SettingCard icon={Bell} dot="bg-gold" label="اعلان‌ها" />
          <SettingCard icon={Palette} dot="bg-gold" label="ظاهر و تم" hint="لاجورد و طلا" />
          <SettingCard icon={Globe} dot="bg-trust" label="زبان" hint="فارسی" />
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            await signOut()
            navigate('/login', { replace: true })
          }}
          className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-crimson/60 bg-crimson/30 py-3.5 font-fa font-semibold text-pearl transition hover:bg-crimson"
        >
          <LogOut size={18} />
          خروج از حساب
        </motion.button>

        <p className="mt-8 text-center font-fa text-[12px] text-pearl/25">Javid Nam · جاوید نام · نسخه ۳.۰</p>
      </div>
    </motion.div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="glass flex flex-col items-center rounded-[14px] py-3">
      <span className="font-fa text-lg font-bold text-gold">{value}</span>
      <span className="font-fa text-[12px] text-pearl/50">{label}</span>
    </div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-fa text-[13px] text-pearl/45">{label}</label>
      {children}
    </div>
  )
}

function SettingCard({ icon: Icon, dot, label, hint }) {
  return (
    <motion.button whileTap={{ scale: 0.98 }} className="glass flex w-full items-center gap-3 rounded-[14px] px-4 py-3.5 text-start transition hover:bg-lapis/25">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <Icon size={18} className="text-pearl/70" />
      <span className="flex-1 font-fa text-[14px] text-pearl/90">{label}</span>
      {hint && <span className="font-fa text-[12px] text-pearl/35">{hint}</span>}
    </motion.button>
  )
}
