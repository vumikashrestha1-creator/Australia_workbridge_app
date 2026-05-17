// =============================================================
// pages/StudentDashboard.jsx
// PURPOSE: Main dashboard for logged-in students
//
// SHOWS:
//   — Welcome header with student name
//   — Stats cards (total / pending / interview / offered)
//   — Application pipeline (status badges)
//   — Quick browse jobs CTA
//
// REQUIRES: student must be logged in (we'll add ProtectedRoute later)
// =============================================================

import { useEffect, useState }      from 'react'
import { Link }                     from 'react-router-dom'
import {
  Briefcase, Clock, Calendar, CheckCircle2, XCircle,
  TrendingUp, FileText, Search, Loader2,
}                                   from 'lucide-react'
import { formatDistanceToNow }      from 'date-fns'
import applicationsApi              from '../api/applicationsApi'
import { useAuth }                  from '../context/AuthContext'
import UpcomingEvents               from '../components/UpcomingEvents'

const StudentDashboard = () => {
  const { user } = useAuth()

  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  // ─── FETCH STUDENT'S APPLICATIONS ──────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await applicationsApi.myApplications()
        setApplications(data)
      } catch (err) {
        setError('Could not load your applications.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ─── CALCULATE STATS ───────────────────────────────────
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

      {/* ── WELCOME HEADER ──────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0] || 'Student'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Track your applications and discover new opportunities
        </p>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────── */}
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

      {/* ── APPLICATIONS LIST ──────────────────────────── */}
      {/* ── MAIN LAYOUT: Applications + Calendar ──────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">

      {/* ── APPLICATIONS LIST ──────────────────────────── */}
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

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary-600 animate-spin" />
          </div>
        )}

        {/* Error state */}
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

        {/* Application cards */}
        {!loading && !error && applications.length > 0 && (
          <div className="space-y-3">
            {applications.map((app) => (
              <ApplicationRow key={app.id} application={app} />
            ))}
          </div>
        )}
      </div>

      {/* ── UPCOMING EVENTS SIDEBAR ──────────────────── */}
      <UpcomingEvents applications={applications} />

      </div>
    </div>
  )
}


// ─── SUB-COMPONENT: Stat Card ───────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    amber:   'bg-amber-50 text-amber-600',
    blue:    'bg-blue-50 text-blue-600',
    green:   'bg-green-50 text-green-600',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg mb-3 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}


// ─── SUB-COMPONENT: Application Row ─────────────────────────
const ApplicationRow = ({ application }) => {
  const job          = application.job_details || {}
  const employerName =
    job.employer_details?.company_name ||
    job.employer_details?.full_name ||
    'Employer'

  const initial = employerName.charAt(0).toUpperCase()
  const appliedAgo = application.applied_at
    ? formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })
    : ''

  return (
    <Link
      to={`/jobs/${application.job}`}
      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition group"
    >
      {/* Avatar */}
      <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold flex-shrink-0">
        {initial}
      </div>

      {/* Job info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 group-hover:text-primary-600 truncate">
          {job.title || 'Job'}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {employerName} · Applied {appliedAgo}
        </p>
      </div>

      {/* Status badge */}
      <StatusBadge status={application.status} />
    </Link>
  )
}


// ─── SUB-COMPONENT: Status Badge ────────────────────────────
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
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${item.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  )
}


export default StudentDashboard