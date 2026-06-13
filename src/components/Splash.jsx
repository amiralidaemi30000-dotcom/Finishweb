import { useEffect } from 'react'
import { motion } from 'framer-motion'

// App-open splash: pure midnight → هامیک writes itself in gold → one breath → fade.
export default function Splash({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-base"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        animate={{ scale: [1, 1, 1.05, 1] }}
        transition={{ duration: 2.2, times: [0, 0.75, 0.85, 1] }}
        className="flex flex-col items-center"
      >
        <svg width="240" height="120" viewBox="0 0 240 120" fill="none">
          {/* a single confident gold brushstroke that draws itself under the name */}
          <motion.path
            d="M30 78 C 70 30, 110 30, 130 60 S 180 90, 210 48"
            stroke="#D4AF37"
            strokeWidth="5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.4, ease: 'easeInOut' }}
          />
          {/* هامیک in gold, fading in over the stroke */}
          <motion.text
            x="120"
            y="64"
            textAnchor="middle"
            fontFamily="Vazirmatn, Inter, sans-serif"
            fontWeight="700"
            fontSize="52"
            fill="#D4AF37"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
          >
            هامیک
          </motion.text>
        </svg>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          className="mt-2 font-fa text-[13px] tracking-wide text-pearl/45"
        >
          فضای امن توست
        </motion.p>
      </motion.div>
    </motion.div>
  )
}
