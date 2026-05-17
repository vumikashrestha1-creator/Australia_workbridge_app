// =============================================================
// pages/JobApplicants.jsx
// PURPOSE: Employer reviews applicants for one job
// Shows resume + cover letter download links per applicant
// =============================================================

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Users, GraduationCap, Mail, Calendar,
  Clock, CheckCircle2, XCircle, TrendingUp, Loader2,
  MapPin, FileText, Download,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import applicationsApi from '../api/applicationsApi'
import jobsApi from '../api/jobsApi'
import { mediaUrl } from '../api/axios'

const JobApplicants = () => {
  const { jobId } = useParams()

  const [job, setJob] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobData, appsData] = await Promise.all([
          jobsApi.getById(jobId),
          applicationsApi.byJob(jobId),
        ])
        setJob(jobData)
        setApplications(appsData)
      } catch {
        setError('Could not load applicants.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [jobId])

  const handleStatusChange = async (appId, payload) => {
    try {
      const updated = await applicationsApi.updateStatus(appId, payload)
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? updated : a))
      )
    } catch (err) {
      alert('Could not update. Please try again.')
      throw err
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
      <Link
        to="/employer/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Applicants for: {job && job.title}
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

      {applications.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
            <Users className="w-7 h-7 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">No applicants yet</h3>
          <p className="text-sm text-gray-600">
            Applications will appear here as students apply
          </p>
        </div>
      )}

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


// ─── APPLICANT CARD ──────────────────────────────────────
const ApplicantCard = ({ application, onStatusChange }) => {
  const student = application.student_details || {}
  const appliedAgo = formatDistanceToNow(
    new Date(application.applied_at),
    { addSuffix: true }
  )

  const openFile = (url) => {
    if (url) window.open(mediaUrl(url), '_blank')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">

        {/* Avatar */}
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
          {student.full_name ? student.full_name.charAt(0) : 'S'}
        </div>

        {/* Student info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900">{student.full_name}</h3>
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
              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                Cover Note
              </p>
              {application.cover_note}
            </div>
          )}

          {/* ── DOCUMENTS — Resume + Cover Letter ── */}
          {(application.resume || application.cover_letter) && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Documents
              </p>
              <div className="flex flex-wrap gap-2">
                {application.resume && (
                  <button
                    type="button"
                    onClick={() => openFile(application.resume)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-medium rounded-lg transition"
                  >
                    <FileText className="w-4 h-4" />
                    Resume
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                {application.cover_letter && (
                  <button
                    type="button"
                    onClick={() => openFile(application.cover_letter)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition"
                  >
                    <FileText className="w-4 h-4" />
                    Cover Letter
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Status selector */}
        <div className="flex flex-col gap-2 sm:items-end">
          <StatusBadge status={application.status} />
          <select
            value={application.status}
            onChange={(e) =>
              onStatusChange(application.id, { status: e.target.value })
            }
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

      {/* Interview scheduler when status is interview */}
      {application.status === 'interview' && (
        <InterviewScheduler
          application={application}
          onSchedule={onStatusChange}
        />
      )}
    </div>
  )
}


// ─── INTERVIEW SCHEDULER ─────────────────────────────────
const InterviewScheduler = ({ application, onSchedule }) => {
  const initialDate = application.interview_date
    ? application.interview_date.slice(0, 16)
    : ''

  const [date, setDate] = useState(initialDate)
  const [notes, setNotes] = useState(application.interview_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await onSchedule(application.id, {
        status: 'interview',
        interview_date: date || null,
        interview_notes: notes,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      // handled in parent
    } finally {
      setSaving(false)
    }
  }

  const isReschedule = !!application.interview_date

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 bg-blue-50 -mx-5 -mb-5 px-5 py-4 rounded-b-xl">
      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1">
        <Calendar className="w-4 h-4 text-blue-600" />
        {isReschedule ? 'Reschedule Interview' : 'Schedule Interview'}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-600 mb-1">Date &amp; time</label>
          <input
            type="datetime-local"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Location or video link</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Zoom link or office address"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
          />
        </div>
      </div>

      {application.interview_date && !saved && (
        <p className="text-xs text-gray-600 mb-2 inline-flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Currently scheduled for{' '}
          <span className="font-medium">
            {new Date(application.interview_date).toLocaleString('en-AU', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </span>
        </p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !date}
        className="text-sm bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 text-white font-medium px-4 py-1.5 rounded-lg transition inline-flex items-center gap-1"
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Calendar className="w-3.5 h-3.5" />}
        {saved ? 'Saved!' : isReschedule ? 'Update Interview' : 'Save Interview Details'}
      </button>
    </div>
  )
}


// ─── STATUS BADGE ────────────────────────────────────────
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


export default JobApplicants