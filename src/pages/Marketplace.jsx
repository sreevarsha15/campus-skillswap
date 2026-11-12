import { useEffect, useState } from 'react'
import { Search, Sparkles, Star, Award, CalendarPlus, ArrowLeftRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import BookingModal from '../components/BookingModal'

export default function Marketplace({ currentUser, onRefreshProfile }) {
  const [mentors, setMentors] = useState([])
  const [mySkills, setMySkills] = useState([])
  const [search, setSearch] = useState('')
  const [onlyMutual, setOnlyMutual] = useState(false)
  const [selectedMentor, setSelectedMentor] = useState(null)
  const [loading, setLoading] = useState(true)

  const loadMarketplace = async () => {
    setLoading(true)
    const [{ data: profiles }, { data: skills }, { data: slots }] = await Promise.all([
      supabase.from('profiles').select('*').neq('id', currentUser.id),
      supabase.from('user_skills').select('*'),
      supabase.from('availability_slots').select('*').eq('is_booked', false),
    ])

    const allSkills = skills || []
    setMySkills(allSkills.filter((s) => s.user_id === currentUser.id))

    const enriched = (profiles || []).map((p) => ({
      ...p,
      skills: allSkills.filter((s) => s.user_id === p.id),
      slots: (slots || []).filter((sl) => sl.mentor_id === p.id),
    }))

    setMentors(enriched)
    setLoading(false)
  }

  useEffect(() => {
    loadMarketplace()
  }, [currentUser.id])

  const myLearnSet = new Set(
    mySkills.filter((s) => s.skill_type === 'LEARN').map((s) => s.skill_name.toLowerCase())
  )
  const myTeachSet = new Set(
    mySkills.filter((s) => s.skill_type === 'TEACH').map((s) => s.skill_name.toLowerCase())
  )

  const checkMutualMatch = (mentor) => {
    const theyTeachWhatIWant = mentor.skills.some(
      (s) => s.skill_type === 'TEACH' && myLearnSet.has(s.skill_name.toLowerCase())
    )
    const theyWantWhatITeach = mentor.skills.some(
      (s) => s.skill_type === 'LEARN' && myTeachSet.has(s.skill_name.toLowerCase())
    )
    return theyTeachWhatIWant && theyWantWhatITeach
  }

  const filteredMentors = mentors.filter((m) => {
    const teachList = m.skills.filter((s) => s.skill_type === 'TEACH')
    if (teachList.length === 0) return false
    if (onlyMutual && !checkMutualMatch(m)) return false
    if (!search.trim()) return true

    const q = search.toLowerCase()
    return (
      m.full_name.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      teachList.some((s) => s.skill_name.toLowerCase().includes(q))
    )
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-col justify-between gap-4 rounded-3xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 sm:flex-row sm:items-center sm:p-8">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Sparkles className="h-3.5 w-3.5" /> Peer Micro-Tutoring Marketplace
          </span>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            Swap Skills, Not Money.
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            Book 30-minute live 1-on-1 sessions with campus peers using Time-Credits. Teach a skill to earn credits back.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:w-80">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search React, DSA, Figma, Python..."
              className="w-full rounded-xl border border-slate-700 bg-slate-950/90 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => setOnlyMutual(!onlyMutual)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              onlyMutual
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="h-3.5 w-3.5" />
            {onlyMutual ? 'Showing Mutual Swaps Only' : 'Filter: Mutual Skill Matches'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
          ))}
        </div>
      ) : filteredMentors.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-base font-semibold text-slate-300">No mentors match your filter yet.</p>
          <p className="mt-1 text-sm text-slate-500">
            Head to <strong>Skills & Wallet</strong> to list your skills and open slots, or invite classmates to sign up!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredMentors.map((mentor) => {
            const isMutual = checkMutualMatch(mentor)
            const teachSkills = mentor.skills.filter((s) => s.skill_type === 'TEACH')
            const learnSkills = mentor.skills.filter((s) => s.skill_type === 'LEARN')
            const openSlotCount = mentor.slots.filter((s) => new Date(s.start_time) > new Date()).length

            return (
              <div
                key={mentor.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg transition hover:border-indigo-500/40"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{mentor.full_name}</h3>
                        {mentor.sessions_taught >= 3 && (
                          <span
                            title="Verified Campus Mentor (3+ sessions taught)"
                            className="inline-flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300"
                          >
                            <Award className="h-3 w-3" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{mentor.department}</p>
                    </div>

                    <div className="flex items-center gap-1 rounded-lg bg-slate-950 px-2 py-1 text-xs font-semibold text-amber-300">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{Number(mentor.avg_rating || 5).toFixed(1)}</span>
                      <span className="text-slate-500">({mentor.review_count || 0})</span>
                    </div>
                  </div>

                  {isMutual && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                      <ArrowLeftRight className="h-3.5 w-3.5" /> Mutual Skill Match!
                    </div>
                  )}

                  <p className="mt-3 line-clamp-2 text-xs text-slate-400">{mentor.bio}</p>

                  <div className="mt-4">
                    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      Can Teach
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {teachSkills.map((s) => (
                        <span
                          key={s.id}
                          className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300"
                        >
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {learnSkills.length > 0 && (
                    <div className="mt-3">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        Wants to Learn
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {learnSkills.map((s) => (
                          <span
                            key={s.id}
                            className="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400"
                          >
                            {s.skill_name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <span className="text-xs text-slate-400">
                    <strong className="text-slate-200">{openSlotCount}</strong> open slots
                  </span>
                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 transition hover:bg-indigo-500"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    Book Session
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedMentor && (
        <BookingModal
          mentor={selectedMentor}
          currentUser={currentUser}
          onClose={() => setSelectedMentor(null)}
          onBooked={() => {
            loadMarketplace()
            onRefreshProfile()
          }}
        />
      )}
    </div>
  )
}