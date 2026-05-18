// =============================================================
// components/JobCard.jsx
// PURPOSE: Reusable job card shown in listings
// NEW: Shows "Closing soon" badge + applicant count
// =============================================================

import { Link }                    from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, DollarSign,
  ShieldCheck, Users, AlertCircle,
}                                  from 'lucide-react'
import { formatDistanceToNow, differenceInDays } from 'date-fns'

const JobCard = ({ job }) => {

  // Format posted date
  const postedDate = job.created_at
    ? formatDistanceToNow(new Date(job.created_at), { addSuffix: true })
    : ''

  // Employer display name
  const employerName =
    job.employer_details?.company_name ||
    job.employer_details?.full_name ||
    'Employer'

  const initial = employerName.charAt(0).toUpperCase()

  // ── CLOSING SOON LOGIC ──────────────────────────────────
  // Show warning if deadline is within 5 days
  let closingBadge = null
  if (job.deadline) {
    const daysLeft = differenceInDays(new Date(job.deadline), new Date())
    if (daysLeft < 0) {
      // Already expired — shouldn't show in active listings but just in case
      closingBadge = { label: 'Expired', cls: 'bg-red-100 text-red-700' }
    } else if (daysLeft === 0) {
      closingBadge = { label: 'Closes today!', cls: 'bg-red-100 text-red-700' }
    } else if (daysLeft <= 3) {
      closingBadge = { label: `Closes in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`, cls: 'bg-red-50 text-red-600' }
    } else if (daysLeft <= 7) {
      closingBadge = { label: `${daysLeft} days left`, cls: 'bg-amber-50 text-amber-700' }
    }
  }

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md hover:border-primary-300 transition group"
    >
      <div className="flex items-start gap-4">

        {/* Company avatar */}
        <div className="w-12 h-12 bg-primary-100 text-primary-700 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0">
          {initial}
        </div>

        {/* Job info */}
        <div className="flex-1 min-w-0">

          {/* Title row */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition truncate">
              {job.title}
            </h3>
            {job.visa_sponsored && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full whitespace-nowrap flex-shrink-0">
                <ShieldCheck className="w-3 h-3" />
                Visa Friendly
              </span>
            )}
          </div>

          {/* Employer name */}
          <p className="text-sm text-gray-600 mb-3">{employerName}</p>

          {/* Tags row */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 mb-3">
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

          {/* Bottom row — posted date + applicants + closing badge */}
          <div className="flex items-center justify-between gap-2 flex-wrap">

            {/* Left — posted + applicants */}
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span>Posted {postedDate}</span>
              {job.application_count > 0 && (
                <span className="inline-flex items-center gap-1 text-gray-500">
                  <Users className="w-3 h-3" />
                  {job.application_count} applicant{job.application_count === 1 ? '' : 's'}
                </span>
              )}
            </div>

            {/* Right — closing soon badge */}
            {closingBadge && (
              <span className={'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ' + closingBadge.cls}>
                <AlertCircle className="w-3 h-3" />
                {closingBadge.label}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default JobCard