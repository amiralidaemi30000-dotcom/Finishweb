import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Logo, Wordmark } from '../components/Brand'
import { HERO_BG } from '../lib/assets'

const tap = { scale: 0.95 }
const spring = { type: 'spring', stiffness: 500, damping: 18 }

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const isSignup = mode === 'signup'

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    if (password.length < 6) {
      setError('رمز عبور باید حداقل ۶ حرف باشد.')
      return
    }
    setBusy(true)
    try {
      if (isSignup) {
        const { data, error } = await signUp(email.trim(), password, {
          display_name: name.trim() || email.split('@')[0],
          username: email.split('@')[0],
        })
        if (error) throw error
        if (!data.session) {
          setInfo('حساب ساخته شد! اگر تأیید ایمیل فعال است، ایمیل خود را چک کنید — یا همین حالا وارد شوید.')
          setMode('signin')
        }
      } else {
        const { error } = await signIn(email.trim(), password)
        if (error) throw error
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-y-auto px-7 pb-10 pt-16">
      {/* Higgsfield hero, warm and dimmed behind the glass */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-45"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/30 via-ink/70 to-ink" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="drop-shadow-[0_8px_30px_rgba(201,121,42,0.45)]">
          <Logo size={68} />
        </div>
        <Wordmark shimmer className="mt-5 text-4xl" />
        <p className="mt-3 font-fa text-[15px] leading-7 text-cream/60">
          پیام‌رسانی که با عشق ساخته شده
          <br />
          <span className="text-cream/35">A messenger built with real love.</span>
        </p>
        {/* trust line */}
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-3 py-1">
          <ShieldCheck size={14} className="text-trust" />
          <span className="font-fa text-[12px] text-trust">رمزگذاری سرتاسری</span>
        </div>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="glass-strong relative z-10 mt-8 rounded-3xl p-6 shadow-glass"
      >
        <div className="mb-5 flex gap-1 rounded-2xl bg-cream/[0.04] p-1">
          <TabButton active={!isSignup} onClick={() => setMode('signin')}>
            ورود
          </TabButton>
          <TabButton active={isSignup} onClick={() => setMode('signup')}>
            ثبت‌نام
          </TabButton>
        </div>

        <div className="space-y-3">
          {isSignup && (
            <Field icon={User}>
              <input
                className="input-glass ps-11 font-fa"
                placeholder="نام شما"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </Field>
          )}
          <Field icon={Mail}>
            <input
              type="email"
              required
              dir="ltr"
              className="input-glass ps-11 text-start"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </Field>
          <Field icon={Lock}>
            <input
              type="password"
              required
              dir="ltr"
              className="input-glass ps-11 text-start"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />
          </Field>
        </div>

        {error && <p className="mt-3 font-fa text-[13px] leading-6 text-rose-soft">{error}</p>}
        {info && <p className="mt-3 font-fa text-[13px] leading-6 text-trust/90">{info}</p>}

        <motion.button
          type="submit"
          disabled={busy}
          whileTap={tap}
          transition={spring}
          className="btn-primary mt-5 flex items-center justify-center gap-2 font-fa"
        >
          {busy && <Loader2 size={18} className="animate-spin" />}
          {isSignup ? 'ساختن حساب' : 'ورود به هامیک'}
        </motion.button>

        <p className="mt-4 text-center font-fa text-[13px] text-cream/40">
          {isSignup ? 'قبلاً حساب دارید؟ ' : 'حساب ندارید؟ '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'signin' : 'signup')}
            className="font-semibold text-saffron"
          >
            {isSignup ? 'وارد شوید' : 'بسازید'}
          </button>
        </p>
      </motion.form>

      <p className="relative z-10 mt-8 text-center font-fa text-[12px] text-cream/25">
        ساخته‌شده در فنلاند، برای هر ایرانی · Built for the Iranian diaspora
      </p>
    </div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-xl py-2.5 font-fa text-sm font-semibold transition ${
        active ? 'text-cream' : 'text-cream/40'
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-xl bg-gradient-to-l from-saffron to-rose shadow-glow-saffron"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-cream/35" />
      {children}
    </div>
  )
}

function translateError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid login')) return 'ایمیل یا رمز عبور اشتباه است.'
  if (m.includes('already registered')) return 'این ایمیل قبلاً ثبت شده است. وارد شوید.'
  if (m.includes('rate limit')) return 'تلاش بیش از حد. کمی صبر کنید.'
  return msg || 'مشکلی پیش آمد. دوباره تلاش کنید.'
}
