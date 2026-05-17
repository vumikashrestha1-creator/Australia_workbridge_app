// =============================================================
// components/UpcomingEvents.jsx
// PURPOSE: Student dashboard calendar - shows interviews + deadlines
// =============================================================

import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Briefcase, AlertCircle } from 'lucide-react'
import { formatDistanceToNow, isFuture, isToday, format } from 'date-fns'

const UpcomingEvents = ({ applications = [] }) => {

  // Build list of events from applications
  const events = []

  applications.forEach((app) => {
    // Interview events
    if (app.status === 'interview' && app.interview_date) {
      const date = new Date(app.interview_date)
      events.push({
        id: `interview-${app.id}`,
        type: 'interview',
        date: date,
        title: app.job_details?.title || 'Interview',
        company:
          app.job_details?.employer_details?.company_name ||
          app.job_details?.employer_details?.full_name ||
          'Employer',
        location: app.interview_notes,
        jobId: app.job,
      })
    }

    // Deadline events (only if not yet applied/rejected and deadline is future)
    if (
      app.job_details?.deadline &&
      ['pending', 'shortlisted'].includes(app.status)
    ) {
      const deadlineDate = new Date(app.job_details.deadline)
      if (isFuture(deadlineDate) || isToday(deadlineDate)) {
        events.push({
          id: `deadline-${app.id}`,
          type: 'deadline',
          date: deadlineDate,
          title: app.job_details.title,
          company:
            app.job_details?.employer_details?.company_name ||
            app.job_details?.employer_details?.full_name ||
            'Employer',
          jobId: app.job,
        })
      }
    }
  })

  // Sort by soonest first
  events.sort((a, b) => a.date - b.date)

  // Show maximum 5 events
  const displayEvents = events.slice(0, 5)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600" />
        Upcoming Events
      </h2>

      {displayEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-2">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm font-medium text-gray-600">No upcoming events</p>
          <p className="text-xs text-gray-500 mt-1">
            Interviews and deadlines will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}


// ── Individual event card ────────────────────────────────
const EventCard = ({ event }) => {
  const isInterview = event.type === 'interview'
  const isUpcoming = isFuture(event.date) || isToday(event.date)
  const timeFromNow = formatDistanceToNow(event.date, { addSuffix: true })

  return (
    <Link
      to={`/jobs/${event.jobId}`}
      className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
    >
      <div className="flex items-start gap-2.5">
        <div
          className={
            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ' +
            (isInterview ? 'bg-blue-100' : 'bg-amber-100')
          }
        >
          {isInterview ? (
            <Briefcase className="w-4 h-4 text-blue-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-600" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase mb-0.5">
            {isInterview ? 'Interview' : 'Application Deadline'}
          </p>
          <p className="text-sm font-semibold text-gray-900 truncate">
            {event.title}
          </p>
          <p className="text-xs text-gray-500 truncate">{event.company}</p>

          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600">
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>
              {isInterview
                ? format(event.date, "EEE, dd MMM 'at' h:mm a")
                : format(event.date, 'EEE, dd MMM yyyy')}
            </span>
          </div>

          <p
            className={
              'text-xs mt-0.5 font-medium ' +
              (isUpcoming ? 'text-blue-600' : 'text-gray-400')
            }
          >
            {timeFromNow}
          </p>

          {isInterview && event.location && (
            <div className="flex items-start gap-1 mt-1 text-xs text-gray-600">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export default UpcomingEvents