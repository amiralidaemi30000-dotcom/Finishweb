import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Logo, Wordmark } from '../components/Brand'
import { HERO_BG } from '../lib/assets'

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
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
        // If the project requires email confirmation, no session is returned.
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
      {/* Higgsfield-generated hero, dimmed behind the glass UI */}
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: `url(${HERO_BG})` }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/70 to-ink" />
      {/* floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-primary/30 blur-[1px] animate-float"
            style={{
              width: 6 + (i % 3) * 4,
              height: 6 + (i % 3) * 4,
              top: `${12 + i * 13}%`,
              left: `${(i * 37) % 90}%`,
              animationDelay: `${i * 0.7}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="animate-float drop-shadow-[0_8px_30px_rgba(79,142,247,0.4)]">
          <Logo size={68} />
        </div>
        <Wordmark className="mt-5 text-4xl" />
        <p className="mt-3 font-fa text-[15px] leading-7 text-white/55">
          پیام‌رسانی که با آتش واقعی ساخته شده
          <br />
          <span className="text-white/35">A messenger built with real fire.</span>
        </p>
      </motion.div>

      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative z-10 mt-10 glass-strong rounded-3xl p-6 shadow-glass"
      >
        <div className="mb-5 flex gap-1 rounded-2xl bg-white/[0.04] p-1">
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

        {error && (
          <p className="mt-3 font-fa text-[13px] leading-6 text-rose-300/90">{error}</p>
        )}
        {info && (
          <p className="mt-3 font-fa text-[13px] leading-6 text-emerald-300/90">{info}</p>
        )}

        <button type="submit" disabled={busy} className="btn-primary mt-5 font-fa flex items-center justify-center gap-2">
          {busy && <Loader2 size={18} className="animate-spin" />}
          {isSignup ? 'ساختن حساب' : 'ورود به هامیک'}
        </button>

        <p className="mt-4 text-center font-fa text-[13px] text-white/40">
          {isSignup ? 'قبلاً حساب دارید؟ ' : 'حساب ندارید؟ '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'signin' : 'signup')}
            className="font-semibold text-primary"
          >
            {isSignup ? 'وارد شوید' : 'بسازید'}
          </button>
        </p>
      </motion.form>

      <p className="relative z-10 mt-8 text-center font-fa text-[12px] text-white/25">
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
        active ? 'text-white' : 'text-white/40'
      }`}
    >
      {active && (
        <motion.span
          layoutId="tab-pill"
          className="absolute inset-0 rounded-xl bg-gradient-to-l from-primary/80 to-primary/40 shadow-glow"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon
        size={18}
        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-white/35"
      />
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
