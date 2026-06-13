import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, LogOut, Check, Loader2, Shield, Bell, Palette, AtSign } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import Avatar from '../components/Avatar'

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(profile?.display_name || '')
  const [username, setUsername] = useState(profile?.username || '')
  const [bio, setBio] = useState(profile?.bio || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function save() {
    setSaving(true)
    setSaved(false)
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim(),
        username: username.trim().replace(/^@/, ''),
        bio: bio.trim(),
      })
      .eq('id', user.id)
    setSaving(false)
    if (!error) {
      setSaved(true)
      refreshProfile()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      transition={{ duration: 0.25 }}
      className="flex h-full flex-col overflow-y-auto"
    >
      <header className="glass-strong z-20 flex items-center gap-3 px-3 py-3">
        <button
          onClick={() => navigate('/')}
          className="rounded-full p-2 text-white/70 transition hover:bg-white/5 active:scale-90"
          aria-label="بازگشت"
        >
          <ArrowRight size={22} />
        </button>
        <h1 className="font-fa text-lg font-bold text-white">پروفایل</h1>
      </header>

      <div className="px-5 pb-12 pt-6">
        {/* Identity */}
        <div className="flex flex-col items-center">
          <div className="relative">
            <Avatar name={name || user.email} src={profile?.avatar_url} size={104} ring />
            <span className="absolute bottom-1 end-1 h-5 w-5 rounded-full border-2 border-ink bg-emerald-400" />
          </div>
          <p className="mt-4 font-fa text-xl font-bold text-white">{name || 'کاربر هامیک'}</p>
          <p className="mt-1 text-[13px] text-white/40" dir="ltr">
            {user.email}
          </p>
        </div>

        {/* Editable fields */}
        <div className="mt-8 space-y-4">
          <Labeled label="نام نمایشی">
            <input className="input-glass font-fa" value={name} onChange={(e) => setName(e.target.value)} />
          </Labeled>

          <Labeled label="نام کاربری">
            <div className="relative">
              <AtSign size={17} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-white/35" />
              <input
                dir="ltr"
                className="input-glass ps-11 text-start"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
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

          <button
            onClick={save}
            disabled={saving}
            className="btn-primary font-fa flex items-center justify-center gap-2"
          >
            {saving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : saved ? (
              <Check size={18} />
            ) : null}
            {saved ? 'ذخیره شد' : 'ذخیره تغییرات'}
          </button>
        </div>

        {/* Settings rows (visual) */}
        <div className="mt-8 overflow-hidden rounded-2xl glass">
          <Row icon={Shield} label="حریم خصوصی و امنیت" hint="رمزنگاری سرتاسری" />
          <Row icon={Bell} label="اعلان‌ها" />
          <Row icon={Palette} label="ظاهر" hint="تیره" />
        </div>

        <button
          onClick={async () => {
            await signOut()
            navigate('/login', { replace: true })
          }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 py-3.5 font-fa font-semibold text-rose-300 transition active:scale-[0.98]"
        >
          <LogOut size={18} />
          خروج از حساب
        </button>

        <p className="mt-8 text-center font-fa text-[12px] text-white/25">
          HAMIK · نسخه ۱.۰ · ساخته‌شده با ❤️ برای ایرانیان
        </p>
      </div>
    </motion.div>
  )
}

function Labeled({ label, children }) {
  return (
    <div>
      <label className="mb-1.5 block font-fa text-[13px] text-white/45">{label}</label>
      {children}
    </div>
  )
}

function Row({ icon: Icon, label, hint }) {
  return (
    <button className="flex w-full items-center gap-3 border-b border-white/[0.05] px-4 py-3.5 text-start transition last:border-0 hover:bg-white/[0.03]">
      <Icon size={19} className="text-primary" />
      <span className="flex-1 font-fa text-[14px] text-white/85">{label}</span>
      {hint && <span className="font-fa text-[12px] text-white/35">{hint}</span>}
    </button>
  )
}
