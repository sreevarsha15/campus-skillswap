import { useState } from 'react'
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(true)
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignup) {
        const { data, error: signUpErr } = await supabase.auth.signUp({ email, password })
        if (signUpErr) throw signUpErr

        if (data.user) {
          const { error: profErr } = await supabase.from('profiles').insert({
            id: data.user.id,
            full_name: fullName || email.split('@')[0],
            college_email: email,
            department,
            credits: 2,
          })
          if (profErr) throw profErr

          await supabase.from('credit_ledger').insert({
            user_id: data.user.id,
            amount: 2,
            reason: 'Welcome bonus: 2 free Time-Credits',
          })
        }
      } else {
        const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password })
        if (signInErr) throw signInErr
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/40 via-slate-950 to-slate-950 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/30">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">CampusSwap</h1>
            <p className="text-xs text-slate-400">Zero-cost peer tutoring powered by Time-Credits</p>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-950 p-1">
          <button
            type="button"
            onClick={() => setIsSignup(true)}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              isSignup ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setIsSignup(false)}
            className={`rounded-lg py-2 text-xs font-semibold transition ${
              !isSignup ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Sign In
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Full Name</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Sree Varsha"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">Department</label>
                <input
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">College Email</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@college.edu.in"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-400">Password</label>
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : isSignup ? 'Join & Claim 2 Free Credits' : 'Enter CampusSwap'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>Verified Campus Peer Learning Network</span>
        </div>
      </div>
    </div>
  )
}