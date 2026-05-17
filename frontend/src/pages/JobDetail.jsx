// =============================================================
// pages/JobDetail.jsx
// PURPOSE: Show full details of one job + apply form + reviews
//
// FLOW:
//   1. Read job ID from URL (/jobs/:id)
//   2. Fetch job details + reviews in parallel
//   3. Show job info, employer card, reviews
//   4. If logged in as student → show Apply button
//   5. If not logged in → show "Login to Apply" link
//   6. If already applied → show "Application submitted" state
// =============================================================

import { useEffect, useState }       from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, DollarSign, ShieldCheck,
  Calendar, Building2, Star, ArrowLeft, Loader2,
  CheckCircle2,
}                                    from 'lucide-react'
import { formatDistanceToNow }       from 'date-fns'
import jobsApi                       from '../api/jobsApi'
import reviewsApi                    from '../api/reviewsApi'
import applicationsApi               from '../api/applicationsApi'
import { useAuth }                   from '../context/AuthContext'

const JobDetail = () => {
  const { id }     = useParams()         // job ID from URL
  const navigate   = useNavigate()
  const { user, isStudent } = useAuth()

  // ─── DATA STATE ────────────────────────────────────────
  const [job,     setJob]     = useState(null)
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ─── APPLY FORM STATE ──────────────────────────────────
  const [coverNote,    setCoverNote]    = useState('')
  const [applying,     setApplying]     = useState(false)
  const [applyError,   setApplyError]   = useState('')
  const [applySuccess, setApplySuccess] = useState(false)

  // ─── FETCH JOB + REVIEWS ───────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [jobData, reviewsData] = await Promise.all([
          jobsApi.getById(id),
          reviewsApi.byJob(id),
        ])
        setJob(jobData)
        setReviews(reviewsData)
      } catch (err) {
        setError('Could not load job details.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  // ─── HANDLE APPLY ──────────────────────────────────────
  const handleApply = async (e) => {
    e.preventDefault()
    setApplyError('')
    setApplying(true)

    try {
      await applicationsApi.apply(id, coverNote)
      setApplySuccess(true)
      setCoverNote('')
    } catch (err) {
      const data = err.response?.data
      const message =
        data?.non_field_errors?.[0] ||
        data?.error ||
        data?.detail ||
        'Could not submit application. Please try again.'
      setApplyError(message)
    } finally {
      setApplying(false)
    }
  }

  // ─── LOADING STATE ─────────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  // ─── ERROR STATE ───────────────────────────────────────
  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {error || 'Job not found'}
        </h2>
        <Link to="/jobs" className="text-primary-600 hover:underline mt-3 inline-block">
          ← Back to all jobs
        </Link>
      </div>
    )
  }

  // ─── PREP DISPLAY VALUES ───────────────────────────────
  const employerName =
    job.employer_details?.company_name ||
    job.employer_details?.full_name ||
    'Employer'

  const initial    = employerName.charAt(0).toUpperCase()
  const postedDate = formatDistanceToNow(new Date(job.created_at), { addSuffix: true })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── BACK LINK ────────────────────────────────────── */}
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* ── MAIN CONTENT ────────────────────────────────── */}
        <div className="space-y-6">

          {/* JOB HEADER CARD */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {job.title}
                  </h1>
                  {job.visa_sponsored && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full whitespace-nowrap">
                      <ShieldCheck className="w-4 h-4" />
                      Visa Friendly
                    </span>
                  )}
                </div>
                <p className="text-gray-600">{employerName}</p>
                <p className="text-xs text-gray-400 mt-1">Posted {postedDate}</p>
              </div>
            </div>

            {/* DETAILS GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              <DetailItem icon={MapPin}    label="Location"   value={job.location} />
              <DetailItem icon={Clock}     label="Hours/week" value={`${job.hours_per_week} hrs`} />
              <DetailItem icon={Briefcase} label="Type"       value={job.job_type} capitalize />
              <DetailItem icon={DollarSign} label="Salary"    value={job.salary_range || '—'} />
            </div>

            {job.deadline && (
              <div className="flex items-center gap-1.5 mt-4 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                Apply by {new Date(job.deadline).toLocaleDateString('en-AU')}
              </div>
            )}
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              About this role
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          {/* REVIEWS */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Employer Reviews
              </h2>
              {reviews?.total_reviews > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{reviews.average_rating}</span>
                  <span className="text-gray-500">
                    ({reviews.total_reviews} {reviews.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {reviews?.reviews?.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet — be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews?.reviews?.map((review) => (
                  <div key={review.id} className="border-l-4 border-primary-100 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < review.rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {review.student_details?.full_name}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-gray-700">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── SIDEBAR — APPLY CARD ────────────────────────── */}
        <aside>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-20">

            {/* Not logged in */}
            {!user && (
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Apply for this job
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign in or create an account to apply.
                </p>
                <Link
                  to="/login"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition mb-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block w-full border border-gray-300 hover:border-primary-300 text-gray-700 font-semibold py-2.5 rounded-lg transition"
                >
                  Create Account
                </Link>
              </div>
            )}

            {/* Logged in as employer or admin */}
            {user && !isStudent && (
              <div className="text-center py-2">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Only student accounts can apply for jobs.
                </p>
              </div>
            )}

            {/* Logged in as student — success state */}
            {user && isStudent && applySuccess && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Application submitted!
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Track its status from your dashboard.
                </p>
                <button
                  onClick={() => navigate('/student/dashboard')}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition"
                >
                  Go to Dashboard
                </button>
              </div>
            )}

            {/* Logged in as student — apply form */}
            {user && isStudent && !applySuccess && (
              <form onSubmit={handleApply}>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Apply for this role
                </h3>

                {applyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
                    {applyError}
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover note (optional)
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={5}
                  placeholder="Briefly explain why you're a good fit..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-3"
                />

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </form>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}


// Small helper sub-component for the details grid
const DetailItem = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`text-sm font-medium text-gray-900 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  </div>
)

export default JobDetail