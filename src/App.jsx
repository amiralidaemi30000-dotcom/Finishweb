import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from './lib/AuthContext'
import { Logo } from './components/Brand'
import Splash from './components/Splash'
import Login from './screens/Login'
import ChatList from './screens/ChatList'
import Conversation from './screens/Conversation'
import Profile from './screens/Profile'

function FullscreenLoader() {
  return (
    <div className="flex h-full items-center justify-center bg-base">
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Logo size={64} />
      </motion.div>
    </div>
  )
}

function Protected({ children }) {
  const { session, loading } = useAuth()
  if (loading) return <FullscreenLoader />
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { session, loading } = useAuth()
  const location = useLocation()
  const [splash, setSplash] = useState(() => !sessionStorage.getItem('hamik:splash'))

  function endSplash() {
    sessionStorage.setItem('hamik:splash', '1')
    setSplash(false)
  }

  // Phone-shaped frame on desktop, full-bleed on mobile. Mosque pattern wall-to-wall.
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base sm:p-6">
      <div className="mosque relative z-10 flex h-screen w-full max-w-[440px] flex-col overflow-hidden sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] sm:border sm:border-gold/15 sm:shadow-glass">
        <AnimatePresence>{splash && <Splash key="splash" onDone={endSplash} />}</AnimatePresence>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={loading ? <FullscreenLoader /> : session ? <Navigate to="/" replace /> : <Login />}
            />
            <Route path="/" element={<Protected><ChatList /></Protected>} />
            <Route path="/c/:conversationId" element={<Protected><Conversation /></Protected>} />
            <Route path="/me" element={<Protected><Profile /></Protected>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
