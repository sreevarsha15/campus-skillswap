import { useEffect, useState } from 'react'
import { Plus, Trash2, Calendar, Coins, Award, Sparkles, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function MyProfile({ profile, onRefreshProfile }) {
  const [skills, setSkills] = useState([])
  const [slots, setSlots] = useState([])
  const [ledger, setLedger] = useState([])

  const [newSkill, setNewSkill] = useState('')
  const [skillType, setSkillType] = useState('TEACH')
  const [slotDateTime, setSlotDateTime] = useState('')
  const [bio, setBio] = useState(profile?.bio || '')
  const [savingBio, setSavingBio] = useState(false)

  const loadData = async () => {
    const [{ data: sData }, { data: slData }, { data: lData }] = await Promise.all([
      supabase.from('user_skills').select('*').eq('user_id', profile.id),
      supabase
        .from('availability_slots')
        .select('*')
        .eq('mentor_id', profile.id)
        .order('start_time', { ascending: true }),
      supabase
        .from('credit_ledger')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false }),
    ])
    setSkills(sData || [])
    setSlots(slData || [])
    setLedger(lData || [])
  }

  useEffect(() => {
    if (profile?.id) loadData()
  }, [profile?.id])

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkill.trim()) return
    await supabase.from('user_skills').insert({
      user_id: profile.id,
      skill_name: newSkill.trim(),
      skill_type: skillType,
    })
    setNewSkill('')
    loadData()
  }

  const handleDeleteSkill = async (id) => {
    await supabase.from('user_skills').delete().eq('id', id)
    loadData()
  }

  const handleAddSlot = async (e) => {
    e.preventDefault()
    if (!slotDateTime) return
    await supabase.from('availability_slots').insert({
      mentor_id: profile.id,
      start_time: new Date(slotDateTime).toISOString(),
    })
    setSlotDateTime('')
    loadData()
  }

  const handleDeleteSlot = async (id) => {
    await supabase.from('availability_slots').delete().eq('id', id)
    loadData()
  }

  const handleSaveBio = async () => {
    setSavingBio(true)
    await supabase.from('profiles').update({ bio }).eq('id', profile.id)
    setSavingBio(false)
    onRefreshProfile()
  }

  const teachSkills = skills.filter((s) => s.skill_type === 'TEACH')
  const learnSkills = skills.filter((s) => s.skill_type === 'LEARN')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Top Profile & Wallet Summary */}
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.full_name}</h1>
              <p className="text-xs text-slate-400">
                {profile.department} • {profile.college_email}
              </p>
            </div>
            {profile.sessions_taught >= 3 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
                <Award className="h-4 w-4" /> Verified Mentor
              </span>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a short bio about what you're studying or building..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              onClick={handleSaveBio}
              disabled={savingBio}
              className="shrink-0 rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-600"
            >
              {savingBio ? 'Saving...' : 'Save Bio'}
            </button>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/15 to-slate-900 p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
              Time-Credit Wallet
            </span>
            <Coins className="h-5 w-5 text-amber-400" />
          </div>
          <div className="my-2">
            <span className="text-4xl font-extrabold text-white">{profile.credits}</span>
            <span className="ml-2 text-sm text-slate-400">credits available</span>
          </div>
          <p className="text-xs text-slate-400">
            Sessions Taught: <strong className="text-white">{profile.sessions_taught}</strong> • Rating:{' '}
            <strong className="text-amber-300">{Number(profile.avg_rating || 5).toFixed(1)} ★</strong>
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills Manager */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Sparkles className="h-5 w-5 text-indigo-400" /> My Skill Exchange List
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Add what you can teach to appear in the marketplace, and what you want to unlock Mutual Matches.
          </p>

          <form onSubmit={handleAddSkill} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <select
              value={skillType}
              onChange={(e) => setSkillType(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-xs font-semibold text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="TEACH">I Can Teach</option>
              <option value="LEARN">I Want to Learn</option>
            </select>
            <input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g., React.js, C++ Pointers, Figma..."
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              <Plus className="h-4 w-4" /> Add
            </button>
          </form>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-indigo-300">
                Skills I Teach ({teachSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {teachSkills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-200"
                  >
                    {s.skill_name}
                    <button onClick={() => handleDeleteSkill(s.id)} className="text-indigo-300 hover:text-rose-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-300">
                Skills I Want to Learn ({learnSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {learnSkills.map((s) => (
                  <span
                    key={s.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-200"
                  >
                    {s.skill_name}
                    <button onClick={() => handleDeleteSkill(s.id)} className="text-emerald-300 hover:text-rose-400">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Availability Slots Manager */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Calendar className="h-5 w-5 text-emerald-400" /> Teaching Availability Slots
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Publish 30-minute windows when classmates can book you to earn +1 Time-Credit per session.
          </p>

          <form onSubmit={handleAddSlot} className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="datetime-local"
              value={slotDateTime}
              onChange={(e) => setSlotDateTime(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Plus className="h-4 w-4" /> Publish Slot
            </button>
          </form>

          <div className="mt-5 max-h-56 space-y-2 overflow-y-auto pr-1">
            {slots.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-500">
                No time slots published yet.
              </p>
            ) : (
              slots.map((slot) => {
                const dt = new Date(slot.start_time)
                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 text-slate-200">
                      <Clock className="h-4 w-4 text-indigo-400" />
                      <span>
                        {dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at{' '}
                        {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {slot.is_booked ? (
                      <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 font-semibold text-amber-300">
                        Booked
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Credit Transaction Ledger */}
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
        <h2 className="mb-4 text-lg font-bold text-white">Time-Credit Ledger History</h2>
        <div className="divide-y divide-slate-800">
          {ledger.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-slate-200">{item.reason}</p>
                <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                  item.amount > 0
                    ? 'bg-emerald-500/15 text-emerald-300'
                    : 'bg-rose-500/15 text-rose-300'
                }`}
              >
                {item.amount > 0 ? `+${item.amount}` : item.amount} Credit
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}