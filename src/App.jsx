import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Navbar from './components/Navbar'
import AuthPage from './pages/AuthPage'
import Marketplace from './pages/Marketplace'
import MyProfile from './pages/MyProfile'
import BookingsPage from './pages/BookingsPage'
import SessionRoom from './pages/SessionRoom'

export default function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    setProfile(data)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) loadProfile(session.user.id)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-sm text-slate-400">
        Loading CampusSwap...
      </div>
    )
  }

  if (!session || !profile) {
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar profile={profile} />
        <Routes>
          <Route
            path="/"
            element={
              <Marketplace
                currentUser={session.user}
                onRefreshProfile={() => loadProfile(session.user.id)}
              />
            }
          />
          <Route
            path="/profile"
            element={
              <MyProfile
                profile={profile}
                onRefreshProfile={() => loadProfile(session.user.id)}
              />
            }
          />
          <Route path="/bookings" element={<BookingsPage currentUser={session.user} />} />
          <Route
            path="/session/:id"
            element={
              <SessionRoom
                profile={profile}
                onRefreshProfile={() => loadProfile(session.user.id)}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}