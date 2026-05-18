// =============================================================
// pages/StudentDashboard.jsx
// PURPOSE: Main dashboard for logged-in students
// Features:
//   - Stats cards (total, pending, interviews, offers)
//   - Applications list with status badges
//   - Withdraw pending applications
//   - Leave employer review (shortlisted/interview/offered)
//   - Upcoming events sidebar (interviews + deadlines)
// =============================================================

import { useEffect, useState }  from 'react'
import { Link }                 from 'react-router-dom'
import {
  Briefcase, Clock, Calendar, CheckCircle2, XCircle,
  TrendingUp, FileText, Search, Loader2,
}                               from 'lucide-react'
import { formatDistanceToNow }  from 'date-fns'
import applicationsApi          from '../api/applicationsApi'
import api                      from '../api/axios'
import { useAuth }              from '../context/AuthContext'
import UpcomingEvents           from '../components/UpcomingEvents'


const StudentDashboard = () => {
  const { user } = useAuth()

  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  // Fetch student's applications on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await applicationsApi.myApplications()
        setApplications(data)
      } catch {
        setError('Could not load your applications.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Remove withdrawn application from local state
  const handleWithdraw = (applicationId) => {
    setApplications((prev) => prev.filter((a) => a.id !== applicationId))
  }

  // Calculate stats from applications
  const stats = {
    total:       applications.length,
    pending:     applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    interview:   applications.filter(a => a.status === 'interview').length,
    offered:     applications.filter(a => a.status === 'offered').length,
    rejected:    applications.filter(a => a.status === 'rejected').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* WELCOME HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your applications and discover new opportunities
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Total Applications"
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Pending Review"
          value={stats.pending + stats.shortlisted}
          color="amber"
        />
        <StatCard
          icon={Calendar}
          label="Interviews"
          value={stats.interview}
          color="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Offers"
          value={stats.offered}
          color="green"
        />
      </div>

      {/* MAIN LAYOUT — applications + events sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

        {/* APPLICATIONS LIST */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-primary-600" />
              My Applications
            </h2>
            <Link
              to="/jobs"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              <Search className="w-4 h-4" />
              Browse more jobs
            </Link>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && applications.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-full mb-3">
                <Briefcase className="w-7 h-7 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                No applications yet
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Start applying to jobs to see them tracked here
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
              >
                <Search className="w-4 h-4" />
                Browse Jobs
              </Link>
            </div>
          )}

          {/* Applications list */}
          {!loading && !error && applications.length > 0 && (
            <div className="space-y-3">
              {applications.map((app) => (
                <ApplicationRow
                  key={app.id}
                  application={app}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </div>
          )}
        </div>

        {/* UPCOMING EVENTS SIDEBAR */}
        <UpcomingEvents applications={applications} />

      </div>
    </div>
  )
}


// =============================================================
// SUB-COMPONENT: Stat Card
// =============================================================
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    amber:   'bg-amber-50 text-amber-600',
    blue:    'bg-blue-50 text-blue-600',
    green:   'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={'inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ' + colorMap[color]}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}


// =============================================================
// SUB-COMPONENT: Application Row
// Shows one application with:
//   - Company avatar + job title + employer name + time ago
//   - Withdraw button (pending only)
//   - Review button (shortlisted / interview / offered)
//   - Status badge
//   - Review modal (pops up when clicking Review)
// =============================================================
const ApplicationRow = ({ application, onWithdraw }) => {
  const job          = application.job_details || {}
  const employerName =
    job.employer_details?.company_name ||
    job.employer_details?.full_name ||
    'Employer'
  const initial    = employerName.charAt(0).toUpperCase()
  const appliedAgo = application.applied_at
    ? formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })
    : ''

  // Review modal state
  const [showReview,  setShowReview]  = useState(false)
  const [rating,      setRating]      = useState(5)
  const [comment,     setComment]     = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [reviewed,    setReviewed]    = useState(false)
  const [reviewError, setReviewError] = useState('')

  // Withdraw state
  const [withdrawing, setWithdrawing] = useState(false)

  // Which actions are available
  const canWithdraw = application.status === 'pending'
  const canReview   = ['shortlisted', 'interview', 'offered'].includes(application.status)

  // ── WITHDRAW APPLICATION ──────────────────────────────
  const handleWithdraw = async (e) => {
    e.preventDefault()
    if (!window.confirm('Withdraw this application? This cannot be undone.')) return
    setWithdrawing(true)
    try {
      await applicationsApi.withdraw(application.id)
      // Tell parent to remove this row from state
      onWithdraw(application.id)
    } catch (err) {
      alert(err.response?.data?.error || 'Could not withdraw application.')
      setWithdrawing(false)
    }
  }

  // ── SUBMIT REVIEW ─────────────────────────────────────
  const handleSubmitReview = async () => {
    setSubmitting(true)
    setReviewError('')
    try {
      await api.post('/reviews/', {
        job:     application.job,
        rating:  rating,
        comment: comment,
      })
      setReviewed(true)
      setShowReview(false)
    } catch (err) {
      const data = err.response?.data
      setReviewError(
        data?.non_field_errors?.[0] ||
        data?.error ||
        data?.detail ||
        'Could not submit review.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition">

        {/* Company avatar */}
        <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
          {initial}
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {job.title || 'Job'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {employerName} · Applied {appliedAgo}
          </p>
        </div>

        {/* Action buttons + status badge */}
        <div className="flex items-center gap-2 flex-shrink-0">

          {/* Withdraw — pending only */}
          {canWithdraw && (
            <button
              onClick={handleWithdraw}
              disabled={withdrawing}
              className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded-lg font-medium transition disabled:opacity-50"
            >
              {withdrawing ? '...' : 'Withdraw'}
            </button>
          )}

          {/* Review — shortlisted/interview/offered */}
          {canReview && !reviewed && (
            <button
              onClick={() => setShowReview(true)}
              className="text-xs bg-amber-50 hover:bg-amber-100 text-amber-700 px-2 py-1 rounded-lg font-medium transition"
            >
              ★ Review
            </button>
          )}

          {/* Already reviewed */}
          {reviewed && (
            <span className="text-xs text-green-600 font-medium">
              ✓ Reviewed
            </span>
          )}

          {/* Status badge */}
          <StatusBadge status={application.status} />
        </div>
      </div>

      {/* REVIEW MODAL */}
      {showReview && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="font-semibold text-gray-900 mb-1">
              Review {employerName}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              Share your experience to help other international students.
            </p>

            {reviewError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
                {reviewError}
              </div>
            )}

            {/* Star rating */}
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={'text-2xl transition ' + (star <= rating ? 'text-amber-400' : 'text-gray-300')}
                >
                  ★
                </button>
              ))}
              <span className="text-sm text-gray-600 ml-2 self-center">
                {rating} / 5
              </span>
            </div>

            {/* Comment */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Comment{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="How was your experience? Did they respect visa work hour limits?"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition mb-4"
            />

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2 rounded-lg text-sm transition"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                onClick={() => { setShowReview(false); setReviewError('') }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


// =============================================================
// SUB-COMPONENT: Status Badge
// Colour-coded pill showing application status
// =============================================================
const StatusBadge = ({ status }) => {
  const config = {
    pending:     { label: 'Pending',     icon: Clock,        cls: 'bg-gray-100 text-gray-700' },
    shortlisted: { label: 'Shortlisted', icon: TrendingUp,   cls: 'bg-amber-100 text-amber-700' },
    interview:   { label: 'Interview',   icon: Calendar,     cls: 'bg-blue-100 text-blue-700' },
    offered:     { label: 'Offered',     icon: CheckCircle2, cls: 'bg-green-100 text-green-700' },
    rejected:    { label: 'Rejected',    icon: XCircle,      cls: 'bg-red-100 text-red-700' },
  }
  const item = config[status] || config.pending
  const Icon = item.icon
  return (
    <span className={'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ' + item.cls}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  )
}


export default StudentDashboard