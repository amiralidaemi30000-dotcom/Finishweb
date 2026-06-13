import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, User, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Logo, Wordmark } from '../components/Brand'
import { HERO_BG } from '../lib/assets'

const tap = { scale: 0.95 }
const page = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

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
    <motion.div {...page} className="relative flex h-full flex-col overflow-y-auto px-7 pb-10 pt-16">
      {/* Higgsfield mosque ceiling, dimmed — real lapis + gold tilework */}
      <div className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: `url(${HERO_BG})` }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-base/50 via-base/75 to-base" />
      {/* soft lapis glow from the top, like light through a mosque dome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-lapis/30 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="drop-shadow-[0_8px_30px_rgba(212,175,55,0.4)]">
          <Logo size={68} />
        </div>
        <Wordmark shimmer className="mt-5 text-4xl" />
        <p className="mt-3 font-fa text-[15px] leading-7 text-pearl/60">
          فضای امن توست
          <br />
          <span className="text-pearl/35">A private space, built for you.</span>
        </p>
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
        <div className="mb-5 flex gap-1 rounded-2xl bg-base/40 p-1">
          <TabButton active={!isSignup} onClick={() => setMode('signin')}>ورود</TabButton>
          <TabButton active={isSignup} onClick={() => setMode('signup')}>ثبت‌نام</TabButton>
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

        {error && <p className="mt-3 font-fa text-[13px] leading-6 text-crimson">{error}</p>}
        {info && <p className="mt-3 font-fa text-[13px] leading-6 text-trust/90">{info}</p>}

        <motion.button
          type="submit"
          disabled={busy}
          whileTap={tap}
          className="btn-gold mt-5 flex items-center justify-center gap-2 font-fa text-base"
        >
          {busy && <Loader2 size={18} className="animate-spin" />}
          <span className="text-base">{isSignup ? 'ساختن حساب' : 'ورود به هامیک'}</span>
        </motion.button>

        <p className="mt-4 text-center font-fa text-[13px] text-pearl/40">
          {isSignup ? 'قبلاً حساب دارید؟ ' : 'حساب ندارید؟ '}
          <button
            type="button"
            onClick={() => setMode(isSignup ? 'signin' : 'signup')}
            className="font-semibold text-gold"
          >
            {isSignup ? 'وارد شوید' : 'بسازید'}
          </button>
        </p>
      </motion.form>

      <p className="relative z-10 mt-8 text-center font-fa text-[12px] text-pearl/25">
        ساخته‌شده در فنلاند، برای هر ایرانی · Built for the Iranian diaspora
      </p>
    </motion.div>
  )
}

function TabButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex-1 rounded-xl py-2.5 font-fa text-sm font-semibold transition ${
        active ? 'text-base' : 'text-pearl/45'
      }`}
    >
      {active && <motion.span layoutId="tab-pill" className="absolute inset-0 rounded-xl bg-gold shadow-glow-gold" />}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

function Field({ icon: Icon, children }) {
  return (
    <div className="relative">
      <Icon size={18} className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-pearl/40" />
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
