// =============================================================
// pages/JobApplicants.jsx
// PURPOSE: Employer views all applicants for one job
//          and updates their status (pending → shortlisted → etc.)
// =============================================================

import { useEffect, useState }     from 'react'
import { useParams, Link }         from 'react-router-dom'
import {
  ArrowLeft, Users, GraduationCap, Mail, Calendar,
  Clock, CheckCircle2, XCircle, TrendingUp, Loader2,
}                                  from 'lucide-react'
import { formatDistanceToNow }     from 'date-fns'
import applicationsApi             from '../api/applicationsApi'
import jobsApi                     from '../api/jobsApi'

const JobApplicants = () => {
  const { jobId } = useParams()

  const [job,          setJob]          = useState(null)
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  // ─── FETCH JOB + APPLICATIONS ─────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, appsData] = await Promise.all([
          jobsApi.getById(jobId),
          applicationsApi.byJob(jobId),
        ])
        setJob(jobData)
        setApplications(appsData)
      } catch (err) {
        setError('Could not load applicants.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [jobId])

  // ─── UPDATE STATUS ────────────────────────────────────
  const handleStatusChange = async (appId, newStatus) => {
    try {
      const updated = await applicationsApi.updateStatus(appId, newStatus)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? updated : a))
      )
    } catch {
      alert('Could not update status. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Back link */}
      <Link
        to="/employer/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Applicants for: {job?.title}
        </h1>
        <p className="text-gray-600 mt-1 flex items-center gap-1">
          <Users className="w-4 h-4" />
          {applications.length} {applications.length === 1 ? 'applicant' : 'applicants'} total
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Empty state */}
      {applications.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">
            No applicants yet
          </h3>
          <p className="text-sm text-gray-600">
            Applications will appear here as students apply
          </p>
        </div>
      )}

      {/* Applicants list */}
      <div className="space-y-3">
        {applications.map((app) => (
          <ApplicantCard
            key={app.id}
            application={app}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  )
}


// ─── APPLICANT CARD ──────────────────────────────────────────
const ApplicantCard = ({ application, onStatusChange }) => {
  const student = application.student_details || {}
  const appliedAgo = formatDistanceToNow(
    new Date(application.applied_at),
    { addSuffix: true }
  )

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* Avatar */}
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
          {student.full_name?.charAt(0) || 'S'}
        </div>

        {/* Student info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">
            {student.full_name}
          </h3>
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              {student.email}
            </span>
            {student.university && (
              <span className="inline-flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5" />
                {student.university}
              </span>
            )}
            {student.visa_type && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                Visa {student.visa_type}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1 inline-flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Applied {appliedAgo}
          </p>

          {/* Cover note */}
          {application.cover_note && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
              {application.cover_note}
            </div>
          )}
        </div>

        {/* Status selector */}
        <div className="flex flex-col gap-2 sm:items-end">
          <StatusBadge status={application.status} />
          <select
            value={application.status}
            onChange={(e) => onStatusChange(application.id, e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          >
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlist</option>
            <option value="interview">Interview</option>
            <option value="offered">Offer</option>
            <option value="rejected">Reject</option>
          </select>
        </div>
      </div>
    </div>
  )
}


// ─── STATUS BADGE ────────────────────────────────────────────
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
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${item.cls}`}>
      <Icon className="w-3.5 h-3.5" />
      {item.label}
    </span>
  )
}


export default JobApplicants