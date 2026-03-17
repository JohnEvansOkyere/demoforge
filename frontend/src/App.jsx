import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase.js'
import Landing from './pages/Landing.jsx'
import Auth from './pages/Auth.jsx'
import Generate from './pages/Generate.jsx'
import Dashboard from './pages/Dashboard.jsx'
import SharedDemo from './pages/SharedDemo.jsx'
import Navbar from './components/Navbar.jsx'

function App() {
  const [session, setSession] = useState(null)
  const [sessionLoading, setSessionLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setSessionLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans">
      <BrowserRouter>
        <Navbar session={session} />
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth session={session} />} />
            <Route path="/generate" element={<Generate session={session} sessionLoading={sessionLoading} />} />
            <Route path="/dashboard" element={<Dashboard session={session} />} />
            <Route path="/demo/:id" element={<SharedDemo />} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App
