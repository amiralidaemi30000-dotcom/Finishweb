import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './lib/AuthContext'
import { Logo } from './components/Brand'
import Login from './screens/Login'
import ChatList from './screens/ChatList'
import Conversation from './screens/Conversation'
import Profile from './screens/Profile'

function FullscreenLoader() {
  return (
    <div className="flex h-full items-center justify-center bg-ink">
      <div className="animate-float">
        <Logo size={64} />
      </div>
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

  // The app is a phone-shaped frame on desktop, full-bleed on mobile.
  return (
    <div className="aurora relative flex min-h-screen items-center justify-center bg-ink sm:p-6">
      <div className="relative z-10 flex h-screen w-full max-w-[440px] flex-col overflow-hidden bg-ink sm:h-[860px] sm:max-h-[92vh] sm:rounded-[36px] sm:border sm:border-white/10 sm:shadow-glass">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/login"
              element={loading ? <FullscreenLoader /> : session ? <Navigate to="/" replace /> : <Login />}
            />
            <Route
              path="/"
              element={
                <Protected>
                  <ChatList />
                </Protected>
              }
            />
            <Route
              path="/c/:conversationId"
              element={
                <Protected>
                  <Conversation />
                </Protected>
              }
            />
            <Route
              path="/me"
              element={
                <Protected>
                  <Profile />
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </div>
    </div>
  )
}
