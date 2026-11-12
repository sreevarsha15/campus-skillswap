import { Link, useLocation } from 'react-router-dom'
import { Coins, Compass, Calendar, UserCircle, LogOut, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Navbar({ profile }) {
  const { pathname } = useLocation()

  const navItems = [
    { to: '/', label: 'Marketplace', icon: Compass },
    { to: '/bookings', label: 'My Sessions', icon: Calendar },
    { to: '/profile', label: 'Skills & Wallet', icon: UserCircle },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              Campus<span className="text-indigo-400">Swap</span>
            </span>
            <span className="ml-2 hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-medium text-indigo-300 sm:inline-block">
              PEER TIMEBANK
            </span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = pathname === to
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-indigo-600/20 text-indigo-300 ring-1 ring-indigo-500/40'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-300">
            <Coins className="h-4 w-4 text-amber-400" />
            <span>{profile?.credits ?? 0} Credits</span>
          </div>

          <button
            onClick={() => supabase.auth.signOut()}
            title="Sign out"
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 transition hover:border-rose-500/40 hover:text-rose-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  )
}