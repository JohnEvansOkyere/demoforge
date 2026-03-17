import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { fetchMyDemos } from '../lib/api.js'
import DemoCard from '../components/DemoCard.jsx'

function Dashboard({ session }) {
  const navigate = useNavigate()
  const [demos, setDemos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchMyDemos(session.access_token)
        setDemos(data)
      } catch (err) {
        setError(err.message ?? 'Failed to load demos')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [session])

  if (!session) {
    return (
      <div className="flex min-h-[calc(100vh-5rem)] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="font-display text-xl font-bold">Sign in to view your demos</h2>
          <button onClick={() => navigate('/auth')} className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-black">Continue with email</button>
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="mt-20 text-center text-sm text-neutral-500">Loading your demos...</div>
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <header className="mb-8">
        <p className="text-xs font-medium tracking-widest text-neutral-500 uppercase">My Demos</p>
        <p className="mt-1 text-sm text-neutral-400">Saved visions you can revisit, refine, and share.</p>
      </header>
      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
      {!demos.length ? (
        <div className="rounded-2xl border border-dashed border-[#262626] bg-[#050505]/50 p-16 text-center">
          <p className="text-sm text-neutral-500">Your first demo is one idea away.</p>
          <button onClick={() => navigate('/generate')} className="mt-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-2.5 text-sm font-semibold text-black">Open Studio</button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {demos.map(demo => <DemoCard key={demo.id} demo={demo} />)}
        </div>
      )}
    </div>
  )
}

export default Dashboard
