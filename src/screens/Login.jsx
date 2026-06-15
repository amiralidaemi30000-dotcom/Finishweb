import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, ChevronDown, Loader2, ShieldCheck, ArrowRight } from 'lucide-react'
import { useAuth } from '../lib/AuthContext'
import { Logo, Wordmark } from '../components/Brand'

const COUNTRIES = [
  { code: '+358', name: 'فنلاند', flag: '🇫🇮' },
  { code: '+98', name: 'ایران', flag: '🇮🇷' },
  { code: '+46', name: 'سوئد', flag: '🇸🇪' },
  { code: '+49', name: 'آلمان', flag: '🇩🇪' },
  { code: '+44', name: 'بریتانیا', flag: '🇬🇧' },
  { code: '+1', name: 'آمریکا/کانادا', flag: '🇺🇸' },
]

const page = {
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97 },
  transition: { duration: 0.25, ease: 'easeOut' },
}

// Build an E.164 number: country code + local digits (drop a leading 0).
function toE164(countryCode, local) {
  let digits = (local || '').replace(/\D/g, '')
  if (digits.startsWith('0')) digits = digits.slice(1)
  return countryCode + digits
}

export default function Login() {
  const { sendOtp, verifyOtp } = useAuth()
  const [phase, setPhase] = useState('phone') // 'phone' | 'code'
  const [country, setCountry] = useState('+358')
  const [local, setLocal] = useState('')
  const [fullPhone, setFullPhone] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function handleSend(e) {
    e?.preventDefault()
    setError('')
    const digits = local.replace(/\D/g, '')
    if (digits.length < 6) {
      setError('شماره تلفن معتبر نیست.')
      return
    }
    const phone = toE164(country, local)
    setBusy(true)
    try {
      const { error } = await sendOtp(phone)
      if (error) throw error
      setFullPhone(phone)
      setPhase('code')
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div {...page} className="relative flex h-full flex-col overflow-y-auto px-7 pb-10 pt-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-lapis/10 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center text-center"
      >
        <div className="drop-shadow-[0_8px_30px_rgba(212,175,55,0.4)]">
          <Logo size={72} />
        </div>
        <Wordmark shimmer className="mt-5 text-4xl" />
        <p className="mt-3 font-fa text-[15px] leading-7 text-pearl/55">فضای امن توست</p>
        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-trust/30 bg-trust/10 px-3 py-1">
          <ShieldCheck size={14} className="text-trust" />
          <span className="font-fa text-[12px] text-trust">رمزگذاری سرتاسری</span>
        </div>
      </motion.div>

      <div className="relative z-10 mt-9">
        <AnimatePresence mode="wait">
          {phase === 'phone' ? (
            <PhoneStep
              key="phone"
              country={country}
              setCountry={setCountry}
              local={local}
              setLocal={setLocal}
              busy={busy}
              error={error}
              onSubmit={handleSend}
            />
          ) : (
            <CodeStep
              key="code"
              phone={fullPhone}
              verifyOtp={verifyOtp}
              resend={() => sendOtp(fullPhone)}
              onBack={() => {
                setPhase('phone')
                setError('')
              }}
            />
          )}
        </AnimatePresence>
      </div>

      <p className="relative z-10 mt-auto pt-8 text-center font-fa text-[12px] text-pearl/25">
        ساخته‌شده در فنلاند، برای هر ایرانی
      </p>
    </motion.div>
  )
}

function PhoneStep({ country, setCountry, local, setLocal, busy, error, onSubmit }) {
  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      onSubmit={onSubmit}
      className="glass-strong rounded-3xl p-6 shadow-glass"
    >
      <p className="mb-5 text-center font-fa text-[15px] font-semibold text-pearl">
        شماره تلفن خود را وارد کنید
      </p>

      <div className="flex gap-2" dir="ltr">
        {/* country code dropdown */}
        <div className="relative shrink-0">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-full appearance-none rounded-2xl border border-gold/20 bg-lapis/15 ps-3 pe-8 text-[15px] text-pearl outline-none transition focus:border-gold/60"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code} className="bg-base text-pearl">
                {c.flag} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="pointer-events-none absolute end-2.5 top-1/2 -translate-y-1/2 text-pearl/40" />
        </div>

        <div className="relative flex-1">
          <Phone size={18} className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-pearl/35" />
          <input
            type="tel"
            inputMode="tel"
            autoFocus
            dir="ltr"
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            placeholder="40 123 4567"
            className="w-full rounded-2xl border border-gold/20 bg-lapis/15 py-3.5 ps-10 text-[15px] text-pearl placeholder-pearl/35 outline-none transition focus:border-gold/60 focus:shadow-glow-gold"
          />
        </div>
      </div>

      {error && <p className="mt-3 text-center font-fa text-[13px] text-crimson">{error}</p>}

      <motion.button
        type="submit"
        disabled={busy}
        whileTap={{ scale: 0.95 }}
        className="btn-gold mt-5 flex items-center justify-center gap-2 font-fa text-base"
      >
        {busy && <Loader2 size={18} className="animate-spin text-base" />}
        <span className="text-base">دریافت کد</span>
      </motion.button>
    </motion.form>
  )
}

function CodeStep({ phone, verifyOtp, resend, onBack }) {
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [seconds, setSeconds] = useState(60)
  const inputs = useRef([])

  useEffect(() => {
    inputs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (seconds <= 0) return
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [seconds])

  const submit = useCallback(
    async (code) => {
      setError('')
      setBusy(true)
      try {
        const { error } = await verifyOtp(phone, code)
        if (error) throw error
        // success → onAuthStateChange flips the route to the chat list
      } catch (err) {
        setError(translateError(err.message))
        setBusy(false)
      }
    },
    [phone, verifyOtp],
  )

  function setDigit(i, val) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) inputs.current[i + 1]?.focus()
    if (next.every((x) => x !== '')) submit(next.join(''))
  }

  function onKeyDown(i, e) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus()
  }

  function onPaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!text) return
    e.preventDefault()
    const next = text.split('')
    while (next.length < 6) next.push('')
    setDigits(next)
    if (text.length === 6) submit(text)
    else inputs.current[text.length]?.focus()
  }

  async function handleResend() {
    if (seconds > 0) return
    setError('')
    await resend()
    setSeconds(60)
    setDigits(['', '', '', '', '', ''])
    inputs.current[0]?.focus()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.25 }}
      className="glass-strong rounded-3xl p-6 shadow-glass"
    >
      <button onClick={onBack} className="mb-3 flex items-center gap-1 font-fa text-[13px] text-pearl/50">
        <ArrowRight size={16} /> تغییر شماره
      </button>

      <p className="text-center font-fa text-[15px] font-semibold text-pearl">کد ۶ رقمی به شماره شما ارسال شد</p>
      <p className="mt-1 text-center text-[13px] text-pearl/45" dir="ltr">
        {phone}
      </p>

      <div className="mt-6 flex justify-center gap-2" dir="ltr" onPaste={onPaste}>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => (inputs.current[i] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            className="h-14 w-11 rounded-2xl border border-gold/20 bg-lapis/15 text-center text-2xl font-bold text-pearl outline-none transition focus:border-gold/60 focus:shadow-glow-gold"
          />
        ))}
      </div>

      {error && <p className="mt-4 text-center font-fa text-[13px] text-crimson">{error}</p>}

      <motion.button
        onClick={() => submit(digits.join(''))}
        disabled={busy || digits.some((x) => !x)}
        whileTap={{ scale: 0.95 }}
        className="btn-gold mt-6 flex items-center justify-center gap-2 font-fa text-base"
      >
        {busy && <Loader2 size={18} className="animate-spin text-base" />}
        <span className="text-base">ورود به جاوید نام</span>
      </motion.button>

      <button
        onClick={handleResend}
        disabled={seconds > 0}
        className="mt-4 w-full text-center font-fa text-[13px] text-gold disabled:text-pearl/35"
      >
        {seconds > 0 ? `ارسال مجدد کد تا ${seconds} ثانیه` : 'ارسال مجدد کد'}
      </button>
    </motion.div>
  )
}

function translateError(msg = '') {
  const m = msg.toLowerCase()
  if (m.includes('invalid') && m.includes('otp')) return 'کد وارد شده اشتباه است.'
  if (m.includes('expired')) return 'کد منقضی شده است. دوباره درخواست دهید.'
  if (m.includes('token has expired') || m.includes('invalid token')) return 'کد اشتباه یا منقضی است.'
  if (m.includes('rate limit') || m.includes('too many')) return 'تلاش بیش از حد. کمی صبر کنید.'
  if (m.includes('sms') || m.includes('phone provider') || m.includes('unsupported'))
    return 'سرویس پیامک هنوز پیکربندی نشده است.'
  return msg || 'مشکلی پیش آمد. دوباره تلاش کنید.'
}
