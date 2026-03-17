import { Link, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

function Navbar({ session }) {
  const navigate = useNavigate()
  const user = session?.user ?? null

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#171717] glass">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-600 df-glow" />
          <span className="font-display text-base font-bold tracking-tight">DemoForge</span>
        </Link>
        <nav className="flex items-center gap-2">
          <NavLink
            to="/generate"
            className={({ isActive }) =>
              `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/10 text-amber-400'
                  : 'text-neutral-400 hover:text-white'
              }`
            }
          >
            Studio
          </NavLink>
          {user && (
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'text-neutral-400 hover:text-white'
                }`
              }
            >
              My Demos
            </NavLink>
          )}
          {user ? (
            <button
              onClick={handleSignOut}
              className="ml-2 rounded-lg border border-[#262626] bg-[#0a0a0a] px-3.5 py-2 text-sm font-medium text-neutral-400 transition-colors hover:border-[#404040] hover:text-white"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/auth"
              className={({ isActive }) =>
                `ml-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'bg-white/[0.08] text-white hover:bg-white/[0.12]'
                }`
              }
            >
              Sign in
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
