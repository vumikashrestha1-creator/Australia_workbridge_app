// =============================================================
// components/JobCard.jsx
// PURPOSE: Reusable card showing one job in a list
// Used in: JobListings page, employer dashboard, etc.
//
// PROPS:
//   job — the job object from API
// =============================================================

import { Link }            from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, DollarSign, ShieldCheck,
}                          from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const JobCard = ({ job }) => {

  // Format "2 days ago" style dates
  const postedDate = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
    : ''

  // Employer display name — company name or fallback
  const employerName =
    job.employer_details?.company_name ||
    job.employer_details?.full_name ||
    'Employer'

  // Get first letter for avatar circle
  const initial = employerName.charAt(0).toUpperCase()

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-300 transition group"
    >
      <div className="flex items-start gap-4">

        {/* ── COMPANY AVATAR ─────────────────────────────── */}
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
          {initial}
        </div>

        {/* ── JOB INFO ──────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
              {job.title}
            </h3>
            {job.visa_sponsored && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full whitespace-nowrap">
                <ShieldCheck className="w-3 h-3" />
                Visa Friendly
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">{employerName}</p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {job.hours_per_week} hrs/week
            </span>
            <span className="inline-flex items-center gap-1 capitalize">
              <Briefcase className="w-3.5 h-3.5" />
              {job.job_type}
            </span>
            {job.salary_range && (
              <span className="inline-flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" />
                {job.salary_range}
              </span>
            )}
          </div>

          {/* Posted date */}
          <p className="text-xs text-gray-400 mt-3">Posted {postedDate}</p>
        </div>
      </div>
    </Link>
  )
}

export default JobCard