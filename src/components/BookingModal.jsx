import { useState } from 'react'
import { X, Calendar, Clock, ShieldCheck, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BookingModal({ mentor, currentUser, onClose, onBooked }) {
  const teachSkills = mentor.skills.filter((s) => s.skill_type === 'TEACH')
  const openSlots = mentor.slots.filter((s) => !s.is_booked && new Date(s.start_time) > new Date())

  const [selectedSkill, setSelectedSkill] = useState(teachSkills[0]?.skill_name || '')
  const [selectedSlotId, setSelectedSlotId] = useState(openSlots[0]?.id || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleConfirmBooking = async (e) => {
    e.preventDefault()
    if (!selectedSlotId || !selectedSkill) return
    setLoading(true)
    setError('')

    const { error: rpcError } = await supabase.rpc('book_slot_with_escrow', {
      p_slot_id: selectedSlotId,
      p_learner_id: currentUser.id,
      p_skill_topic: selectedSkill,
    })

    setLoading(false)
    if (rpcError) {
      setError(rpcError.message)
    } else {
      onBooked()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Book 30-Min Peer Session</h3>
            <p className="text-xs text-slate-400">Mentor: {mentor.full_name}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleConfirmBooking} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Select Topic
            </label>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              {teachSkills.map((s) => (
                <option key={s.id} value={s.skill_name}>
                  {s.skill_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Available Time Slots
            </label>
            {openSlots.length === 0 ? (
              <p className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                No open slots right now. Ask this mentor to publish availability!
              </p>
            ) : (
              <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
                {openSlots.map((slot) => {
                  const dt = new Date(slot.start_time)
                  const active = selectedSlotId === slot.id
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                        active
                          ? 'border-indigo-500 bg-indigo-500/15 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-indigo-400" />
                        {dt.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="h-3.5 w-3.5" />
                        {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            <span>
              <strong>1 Time-Credit</strong> will be held safely in escrow and transferred to{' '}
              {mentor.full_name} only after your session completes.
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || openSlots.length === 0}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Locking Slot & Escrow...' : 'Confirm Booking (1 Credit)'}
          </button>
        </form>
      </div>
    </div>
  )
}