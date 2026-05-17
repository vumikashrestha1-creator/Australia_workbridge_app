// =============================================================
// components/UpcomingEvents.jsx
// PURPOSE: Show upcoming interviews + application deadlines
//          on the student dashboard
//
// EVENTS COME FROM:
//   1. interview_date on shortlisted/interview applications
//   2. deadline on jobs they have applied to
// =============================================================

import { Calendar, Clock, MapPin, Briefcase, AlertCircle } from 'lucide-react'
import { Link }            from 'react-router-dom'
import { format, isFuture, differenceInDays } from 'date-fns'

const UpcomingEvents = ({ applications }) => {

  // ─── BUILD EVENTS LIST ────────────────────────────────
  const events = []

  applications.forEach((app) => {
    // Add interview events
    if (app.interview_date && isFuture(new Date(app.interview_date))) {
      events.push({
        id:    `interview-${app.id}`,
        type:  'interview',
        date:  new Date(app.interview_date),
        title: `Interview: ${app.job_details?.title || 'Job'}`,
        subtitle: app.job_details?.employer_details?.company_name || 'Employer',
        notes: app.interview_notes,
        link:  `/jobs/${app.job}`,
      })
    }

    // Add upcoming deadlines for applications that aren't rejected/offered
    if (app.job_details?.deadline &&
        ['pending', 'shortlisted'].includes(app.status)) {
      const deadline = new Date(app.job_details.deadline)
      if (isFuture(deadline)) {
        events.push({
          id:    `deadline-${app.id}`,
          type:  'deadline',
          date:  deadline,
          title: `Deadline: ${app.job_details.title}`,
          subtitle: 'Application closes',
          link:  `/jobs/${app.job}`,
        })
      }
    }
  })

  // Sort by date ascending (soonest first)
  events.sort((a, b) => a.date - b.date)

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600" />
        Upcoming Events
      </h2>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-2">
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600">No upcoming events</p>
          <p className="text-xs text-gray-500 mt-1">
            Interviews and deadlines will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {events.slice(0, 5).map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}


// ─── EVENT CARD ──────────────────────────────────────────────
const EventCard = ({ event }) => {
  const daysUntil = differenceInDays(event.date, new Date())
  const isUrgent  = daysUntil <= 2

  const isInterview = event.type === 'interview'
  const Icon        = isInterview ? Briefcase : AlertCircle
  const colorCls    = isInterview ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'

  return (
    <Link
      to={event.link}
      className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition group"
    >
      {/* Date block */}
      <div className="flex flex-col items-center justify-center w-12 h-12 bg-gray-50 rounded-lg flex-shrink-0">
        <span className="text-xs text-gray-500 uppercase font-medium">
          {format(event.date, 'MMM')}
        </span>
        <span className="text-lg font-bold text-gray-900 leading-none">
          {format(event.date, 'd')}
        </span>
      </div>

      {/* Event info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded ${colorCls}`}>
            <Icon className="w-3 h-3" />
            {isInterview ? 'Interview' : 'Deadline'}
          </span>
          {isUrgent && (
            <span className="text-xs text-red-600 font-medium">
              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
            </span>
          )}
        </div>
        <p className="font-medium text-gray-900 text-sm mt-1 truncate group-hover:text-primary-600">
          {event.title}
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {format(event.date, 'h:mm a')}
          </span>
          {event.notes && (
            <span className="inline-flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3" />
              {event.notes}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}


export default UpcomingEvents