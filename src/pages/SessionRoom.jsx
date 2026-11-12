import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles, Save, ArrowLeft, ShieldCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateSessionSummary } from '../lib/gemini'

export default function SessionRoom({ profile, onRefreshProfile }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const jitsiContainerRef = useRef(null)
  const jitsiApiRef = useRef(null)

  const [booking, setBooking] = useState(null)
  const [notes, setNotes] = useState('')
  const [aiSummary, setAiSummary] = useState('')
  const [generatingAi, setGeneratingAi] = useState(false)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      const { data } = await supabase.from('bookings').select('*').eq('id', id).single()
      if (data) {
        setBooking(data)
        setNotes(data.notes || '')
        setAiSummary(data.ai_summary || '')
      }
    }
    fetchBooking()
  }, [id])

  useEffect(() => {
    if (!booking || !jitsiContainerRef.current || jitsiApiRef.current) return
    if (!window.JitsiMeetExternalAPI) return

    jitsiApiRef.current = new window.JitsiMeetExternalAPI('meet.jit.si', {
      roomName: booking.jitsi_room_name,
      parentNode: jitsiContainerRef.current,
      width: '100%',
      height: '100%',
      userInfo: { displayName: profile.full_name },
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
      },
    })

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose()
        jitsiApiRef.current = null
      }
    }
  }, [booking, profile.full_name])

  const handleSaveNotes = async () => {
    await supabase.from('bookings').update({ notes, ai_summary: aiSummary }).eq('id', id)
  }

  const handleGenerateAiRecap = async () => {
    setGeneratingAi(true)
    const summary = await generateSessionSummary(booking.skill_topic, notes)
    setAiSummary(summary)
    await supabase.from('bookings').update({ notes, ai_summary: summary }).eq('id', id)
    setGeneratingAi(false)
  }

  const handleCompleteSession = async () => {
    setCompleting(true)
    await handleSaveNotes()
    const { error } = await supabase.rpc('complete_session_release_credit', {
      p_booking_id: id,
    })
    setCompleting(false)
    if (!error) {
      await onRefreshProfile()
      navigate('/bookings')
    }
  }

  if (!booking) {
    return <div className="p-10 text-center text-sm text-slate-400">Loading live classroom...</div>
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bookings')}
            className="rounded-xl border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">{booking.skill_topic} — Live Room</h1>
            <p className="text-xs text-slate-400">Room ID: {booking.jitsi_room_name}</p>
          </div>
        </div>

        {booking.status === 'SCHEDULED' ? (
          <button
            onClick={handleCompleteSession}
            disabled={completing}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {completing ? 'Transferring Credit...' : 'Complete Session & Release 1 Credit'}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-2 text-xs font-semibold text-emerald-300">
            <ShieldCheck className="h-4 w-4" /> Session Completed • Credit Released
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jitsi Video Call Frame */}
        <div className="h-[520px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 lg:col-span-2">
          <div ref={jitsiContainerRef} className="h-full w-full" />
        </div>

        {/* Shared Scratchpad & Gemini AI Study Summary */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/90 p-5">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-bold text-white">Session Scratchpad & Notes</h2>
              <button
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300 hover:bg-slate-700"
              >
                <Save className="h-3.5 w-3.5" /> Save
              </button>
            </div>
            <textarea
              rows={7}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Jot down key formulas, code snippets, or links discussed during the session..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs leading-relaxed text-slate-200 focus:border-indigo-500 focus:outline-none"
            />

            <button
              onClick={handleGenerateAiRecap}
              disabled={generatingAi}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" />
              {generatingAi ? 'Generating Gemini Recap...' : 'Generate AI Study Summary'}
            </button>

            {aiSummary && (
              <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-indigo-500/25 bg-slate-950 p-3.5">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-indigo-300">
                  Gemini Flash Recap
                </p>
                <p className="whitespace-pre-line text-xs leading-relaxed text-slate-300">{aiSummary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}