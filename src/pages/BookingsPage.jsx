import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Video, Calendar, CheckCircle2, Star, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function BookingsPage({ currentUser }) {
  const [bookings, setBookings] = useState([])
  const [reviewedIds, setReviewedIds] = useState(new Set())
  const [reviewModal, setReviewModal] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(true)

  const loadBookings = async () => {
    setLoading(true)
    const [{ data: bData }, { data: pData }, { data: rData }] = await Promise.all([
      supabase
        .from('bookings')
        .select('*')
        .or(`mentor_id.eq.${currentUser.id},learner_id.eq.${currentUser.id}`)
        .order('scheduled_time', { ascending: false }),
      supabase.from('profiles').select('id, full_name, department'),
      supabase.from('reviews').select('booking_id').eq('learner_id', currentUser.id),
    ])

    const profileMap = Object.fromEntries((pData || []).map((p) => [p.id, p]))
    setReviewedIds(new Set((rData || []).map((r) => r.booking_id)))

    setBookings(
      (bData || []).map((b) => ({
        ...b,
        mentor: profileMap[b.mentor_id],
        learner: profileMap[b.learner_id],
      }))
    )
    setLoading(false)
  }

  useEffect(() => {
    loadBookings()
  }, [currentUser.id])

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewModal) return
    await supabase.rpc('submit_session_review', {
      p_booking_id: reviewModal.id,
      p_rating: rating,
      p_comment: comment,
    })
    setReviewModal(null)
    setComment('')
    setRating(5)
    loadBookings()
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Learning & Teaching Sessions</h1>
        <p className="text-sm text-slate-400">
          Join live Jitsi video rooms, review AI study recaps, and rate your peer mentors.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-32 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-12 text-center">
          <p className="text-base font-semibold text-slate-300">No sessions scheduled yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Browse Mentors in Marketplace
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const isMentor = b.mentor_id === currentUser.id
            const partner = isMentor ? b.learner : b.mentor
            const dt = new Date(b.scheduled_time)

            return (
              <div
                key={b.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          isMentor
                            ? 'bg-indigo-500/20 text-indigo-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {isMentor ? 'You are Teaching' : 'You are Learning'}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          b.status === 'COMPLETED'
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-white">{b.skill_topic}</h3>
                    <p className="text-xs text-slate-400">
                      With <strong className="text-slate-200">{partner?.full_name}</strong> •{' '}
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {dt.toLocaleDateString()} at {dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <Link
                      to={`/session/${b.id}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/25 hover:bg-indigo-500"
                    >
                      <Video className="h-4 w-4" />
                      {b.status === 'SCHEDULED' ? 'Join Live Room' : 'View Notes & Recap'}
                    </Link>

                    {!isMentor && b.status === 'COMPLETED' && !reviewedIds.has(b.id) && (
                      <button
                        onClick={() => setReviewModal(b)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/25"
                      >
                        <Star className="h-4 w-4" /> Rate Mentor
                      </button>
                    )}

                    {!isMentor && reviewedIds.has(b.id) && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" /> Reviewed
                      </span>
                    )}
                  </div>
                </div>

                {b.ai_summary && (
                  <div className="mt-4 rounded-xl border border-indigo-500/20 bg-slate-950/90 p-4">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                      <Sparkles className="h-3.5 w-3.5" /> AI Session Study Summary
                    </p>
                    <p className="whitespace-pre-line text-xs leading-relaxed text-slate-300">{b.ai_summary}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSubmitReview}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl"
          >
            <h3 className="text-lg font-bold text-white">Rate {reviewModal.mentor?.full_name}</h3>
            <p className="text-xs text-slate-400">Topic: {reviewModal.skill_topic}</p>

            <div className="my-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`rounded-xl border px-3.5 py-2 text-sm font-bold ${
                    rating >= star
                      ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                      : 'border-slate-800 bg-slate-950 text-slate-500'
                  }`}
                >
                  {star} ★
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="How helpful was this peer session?"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModal(null)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Submit Review
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}