// =============================================================
// pages/EmployerDashboard.jsx
// PURPOSE: Main dashboard for employers
//
// SHOWS:
//   — Welcome header with company name
//   — Stats cards (jobs / applicants / interviews / hired)
//   — Their job listings with applicant counts
//   — Quick "Post New Job" CTA
// =============================================================

import { useEffect, useState }    from 'react'
import { Link }                   from 'react-router-dom'
import {
  Briefcase, Users, Calendar, CheckCircle2, Plus,
  Eye, Edit, Loader2, TrendingUp,
}                                 from 'lucide-react'
import { formatDistanceToNow }    from 'date-fns'
import jobsApi                    from '../api/jobsApi'
import applicationsApi            from '../api/applicationsApi'
import { useAuth }                from '../context/AuthContext'

const EmployerDashboard = () => {
  const { user } = useAuth()

  const [jobs,         setJobs]         = useState([])
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  // ─── FETCH JOBS + ALL APPLICATIONS ────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get this employer's jobs
        const jobsData = await jobsApi.myJobs()
        setJobs(jobsData)

        // Fetch applications for all their jobs in parallel
        const appsPromises = jobsData.map((job) =>
          applicationsApi.byJob(job.id).catch(() => [])
        )
        const appsResults = await Promise.all(appsPromises)
        // Flatten array of arrays into single list
        const allApps = appsResults.flat()
        setApplications(allApps)
      } catch (err) {
        setError('Could not load your dashboard.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // ─── STATS ─────────────────────────────────────────────
  const stats = {
    totalJobs:       jobs.length,
    activeJobs:      jobs.filter(j => j.status === 'active').length,
    totalApplicants: applications.length,
    interviews:      applications.filter(a => a.status === 'interview').length,
    hired:           applications.filter(a => a.status === 'offered').length,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ── HEADER ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.company_name || user?.full_name || 'Employer'}
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your job listings and applicants
          </p>
        </div>
        <Link
          to="/employer/post-job"
          className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-4 py-2.5 rounded-lg transition self-start"
        >
          <Plus className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* ── STATS CARDS ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Briefcase}
          label="Active Listings"
          value={stats.activeJobs}
          color="primary"
        />
        <StatCard
          icon={Users}
          label="Total Applicants"
          value={stats.totalApplicants}
          color="blue"
        />
        <StatCard
          icon={Calendar}
          label="In Interview"
          value={stats.interviews}
          color="amber"
        />
        <StatCard
          icon={CheckCircle2}
          label="Hires Made"
          value={stats.hired}
          color="green"
        />
      </div>

      {/* ── JOBS LIST ──────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary-600" />
          Your Job Listings
        </h2>

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
        {!loading && !error && jobs.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-50 rounded-full mb-3">
              <Briefcase className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">
              No job listings yet
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Post your first job to start receiving applications
            </p>
            <Link
              to="/employer/post-job"
              className="inline-flex items-center gap-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
            >
              <Plus className="w-4 h-4" />
              Post a Job
            </Link>
          </div>
        )}

        {/* Jobs table */}
        {!loading && !error && jobs.length > 0 && (
          <div className="space-y-3">
            {jobs.map((job) => {
              const jobApps = applications.filter(a => a.job === job.id)
              return (
                <JobRow
                  key={job.id}
                  job={job}
                  applicantCount={jobApps.length}
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


// ─── STAT CARD ───────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    primary: 'bg-primary-50 text-primary-600',
    blue:    'bg-blue-50 text-blue-600',
    amber:   'bg-amber-50 text-amber-600',
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


// ─── JOB ROW ─────────────────────────────────────────────────
const JobRow = ({ job, applicantCount }) => {
  const postedAgo = formatDistanceToNow(new Date(job.created_at), { addSuffix: true })

  // Status badge colour
  const statusColours = {
    active: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
    draft:  'bg-amber-100 text-amber-700',
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">

      {/* Job info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-medium text-gray-900 truncate">{job.title}</h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColours[job.status]}`}>
            {job.status}
          </span>
        </div>
        <p className="text-xs text-gray-500">
          {job.location} · {job.hours_per_week} hrs/week · Posted {postedAgo}
        </p>
      </div>

      {/* Applicants count */}
      <div className="flex items-center gap-2 text-sm">
        <div className="flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-lg font-medium">
          <Users className="w-4 h-4" />
          {applicantCount} {applicantCount === 1 ? 'applicant' : 'applicants'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          to={`/employer/job/${job.id}/applicants`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition"
          title="View applicants"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 hover:border-primary-300 text-gray-700 text-sm font-medium rounded-lg transition"
        >
          <TrendingUp className="w-4 h-4" />
          Preview
        </Link>
      </div>
    </div>
  )
}


export default EmployerDashboard