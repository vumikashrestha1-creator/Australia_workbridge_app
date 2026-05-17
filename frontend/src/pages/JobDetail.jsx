import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  MapPin, Clock, Briefcase, DollarSign, ShieldCheck,
  Calendar, Building2, Star, ArrowLeft, Loader2,
  CheckCircle2, XCircle, TrendingUp, FileText, Upload, X,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import jobsApi from '../api/jobsApi'
import reviewsApi from '../api/reviewsApi'
import applicationsApi from '../api/applicationsApi'
import { useAuth } from '../context/AuthContext'
import { mediaUrl } from '../api/axios'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isStudent } = useAuth()

  const [job, setJob] = useState(null)
  const [reviews, setReviews] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [myApplication, setMyApplication] = useState(null)

  const [coverNote, setCoverNote] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetterFile, setCoverLetterFile] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applyError, setApplyError] = useState('')
  const [applySuccess, setApplySuccess] = useState(false)

  const resumeInputRef = useRef(null)
  const coverLetterInputRef = useRef(null)

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

        if (user && isStudent) {
          try {
            const myApps = await applicationsApi.myApplications()
            const existing = myApps.find((a) => a.job === parseInt(id))
            if (existing) setMyApplication(existing)
          } catch {
            // not critical
          }
        }
      } catch {
        setError('Could not load job details.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id, user, isStudent])

  const validateFile = (file) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!validTypes.includes(file.type)) return 'File must be PDF or Word.'
    if (file.size > 5 * 1024 * 1024) return 'File must be less than 5 MB.'
    return null
  }

  const handleResumeChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setApplyError('Resume: ' + err); return }
    setApplyError('')
    setResumeFile(file)
  }

  const handleCoverLetterChange = (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    const err = validateFile(file)
    if (err) { setApplyError('Cover letter: ' + err); return }
    setApplyError('')
    setCoverLetterFile(file)
  }

  const handleApply = async (e) => {
    e.preventDefault()
    setApplyError('')

    if (!resumeFile) {
      setApplyError('Please attach your resume before submitting.')
      return
    }

    setApplying(true)
    try {
      const newApp = await applicationsApi.apply({
        jobId: id,
        coverNote,
        resumeFile,
        coverLetterFile,
      })
      setApplySuccess(true)
      setMyApplication(newApp)
      setCoverNote('')
      setResumeFile(null)
      setCoverLetterFile(null)
    } catch (err) {
      const data = err.response && err.response.data
      const message =
        (data && data.non_field_errors && data.non_field_errors[0]) ||
        (data && data.error) ||
        (data && data.detail) ||
        'Could not submit application. Please try again.'
      setApplyError(message)
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {error || 'Job not found'}
        </h2>
        <Link to="/jobs" className="text-primary-600 hover:underline mt-3 inline-block">
          Back to all jobs
        </Link>
      </div>
    )
  }

  const employerName =
    (job.employer_details && job.employer_details.company_name) ||
    (job.employer_details && job.employer_details.full_name) ||
    'Employer'
  const initial = employerName.charAt(0).toUpperCase()
  const postedDate = formatDistanceToNow(new Date(job.created_at), { addSuffix: true })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        to="/jobs"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to all jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
              <DetailItem icon={MapPin} label="Location" value={job.location} />
              <DetailItem icon={Clock} label="Hours/week" value={job.hours_per_week + ' hrs'} />
              <DetailItem icon={Briefcase} label="Type" value={job.job_type} capitalize />
              <DetailItem icon={DollarSign} label="Salary" value={job.salary_range || '-'} />
            </div>

            {job.deadline && (
              <div className="flex items-center gap-1.5 mt-4 text-sm text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
                <Calendar className="w-4 h-4" />
                Apply by {new Date(job.deadline).toLocaleDateString('en-AU')}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">About this role</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {job.description}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Employer Reviews</h2>
              {reviews && reviews.total_reviews > 0 && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-semibold">{reviews.average_rating}</span>
                  <span className="text-gray-500">
                    ({reviews.total_reviews} {reviews.total_reviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>
              )}
            </div>

            {reviews && reviews.reviews && reviews.reviews.length === 0 ? (
              <p className="text-sm text-gray-500">
                No reviews yet - be the first to share your experience.
              </p>
            ) : (
              <div className="space-y-4">
                {reviews && reviews.reviews && reviews.reviews.map((review) => (
                  <div key={review.id} className="border-l-4 border-primary-100 pl-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="flex">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <Star
                            key={i}
                            className={'w-3.5 h-3.5 ' + (i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200')}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">
                        {review.student_details && review.student_details.full_name}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm text-gray-700">{review.comment}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside>
          <div className="bg-white border border-gray-200 rounded-2xl p-6 lg:sticky lg:top-20">
            {!user && (
              <div className="text-center">
                <h3 className="font-semibold text-gray-900 mb-2">Apply for this job</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign in or create an account to apply.
                </p>
                <Link to="/login" className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition mb-2">
                  Sign In
                </Link>
                <Link to="/register" className="block w-full border border-gray-300 hover:border-primary-300 text-gray-700 font-semibold py-2.5 rounded-lg transition">
                  Create Account
                </Link>
              </div>
            )}

            {user && !isStudent && (
              <div className="text-center py-2">
                <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Only student accounts can apply for jobs.
                </p>
              </div>
            )}

            {user && isStudent && applySuccess && (
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Application submitted!</h3>
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

            {user && isStudent && !applySuccess && myApplication && (
              <AlreadyAppliedCard
                application={myApplication}
                onGoToDashboard={() => navigate('/student/dashboard')}
              />
            )}

            {user && isStudent && !applySuccess && !myApplication && (
              <form onSubmit={handleApply}>
                <h3 className="font-semibold text-gray-900 mb-1">Apply for this role</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Attach your resume and an optional cover letter.
                </p>

                {applyError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm mb-3">
                    {applyError}
                  </div>
                )}

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover note <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  rows={3}
                  placeholder="A quick message to the employer..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition mb-4"
                />

                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resume <span className="text-red-500">*</span>
                </label>
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeChange}
                  className="hidden"
                />
                <FileBox
                  file={resumeFile}
                  onClear={() => {
                    setResumeFile(null)
                    if (resumeInputRef.current) resumeInputRef.current.value = ''
                  }}
                  onClick={() => resumeInputRef.current && resumeInputRef.current.click()}
                  placeholder="Attach resume (PDF or Word)"
                  required
                />

                <label className="block text-sm font-medium text-gray-700 mb-1 mt-3">
                  Cover letter <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  ref={coverLetterInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleCoverLetterChange}
                  className="hidden"
                />
                <FileBox
                  file={coverLetterFile}
                  onClear={() => {
                    setCoverLetterFile(null)
                    if (coverLetterInputRef.current) coverLetterInputRef.current.value = ''
                  }}
                  onClick={() => coverLetterInputRef.current && coverLetterInputRef.current.click()}
                  placeholder="Attach cover letter (PDF or Word)"
                />

                <p className="text-xs text-gray-400 mt-2 mb-3">
                  Max 5 MB per file. Accepted: PDF, DOC, DOCX.
                </p>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-2"
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


const FileBox = ({ file, onClear, onClick, placeholder, required }) => {
  if (file) {
    return (
      <div className="flex items-center gap-2 p-2.5 border border-green-200 bg-green-50 rounded-lg">
        <FileText className="w-4 h-4 text-green-600 flex-shrink-0" />
        <span className="text-xs text-gray-800 truncate flex-1 font-medium">
          {file.name}
        </span>
        <span className="text-xs text-gray-500">
          {(file.size / 1024).toFixed(0)} KB
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-gray-400 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={'w-full flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg transition text-sm ' +
        (required
          ? 'border-gray-300 hover:border-primary-400 hover:bg-primary-50 text-gray-600'
          : 'border-gray-200 hover:border-primary-300 text-gray-500')
      }
    >
      <Upload className="w-4 h-4" />
      {placeholder}
    </button>
  )
}


const AlreadyAppliedCard = ({ application, onGoToDashboard }) => {
  const appliedAgo = formatDistanceToNow(new Date(application.applied_at), { addSuffix: true })

  const statusConfig = {
    pending:     { label: 'Application Pending', icon: Clock, cls: 'bg-gray-50 text-gray-700 border-gray-200', iconColor: 'text-gray-500', message: 'Your application is awaiting employer review.' },
    shortlisted: { label: 'Shortlisted', icon: TrendingUp, cls: 'bg-amber-50 text-amber-700 border-amber-200', iconColor: 'text-amber-500', message: 'The employer has shortlisted your application.' },
    interview:   { label: 'Interview Scheduled', icon: Calendar, cls: 'bg-blue-50 text-blue-700 border-blue-200', iconColor: 'text-blue-500', message: 'You have been invited to interview for this role.' },
    offered:     { label: 'Offer Received', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200', iconColor: 'text-green-500', message: 'Congratulations! You have received an offer.' },
    rejected:    { label: 'Not Selected', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200', iconColor: 'text-red-500', message: 'Unfortunately, you were not selected this time.' },
  }

  const config = statusConfig[application.status] || statusConfig.pending
  const Icon = config.icon

  const openFile = (url) => {
    if (url) window.open(mediaUrl(url), '_blank')
  }

  return (
    <div>
      <h3 className="font-semibold text-gray-900 mb-1">Application Status</h3>
      <p className="text-xs text-gray-500 mb-4">Applied {appliedAgo}</p>

      <div className={'border rounded-lg p-3 mb-3 ' + config.cls}>
        <div className="flex items-center gap-2 mb-1">
          <Icon className={'w-5 h-5 ' + config.iconColor} />
          <span className="font-semibold text-sm">{config.label}</span>
        </div>
        <p className="text-xs">{config.message}</p>
      </div>

      {application.status === 'interview' && application.interview_date && (
        <div className="bg-white border border-blue-200 rounded-lg p-3 mb-3">
          <p className="text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Interview Details
          </p>
          <p className="text-sm font-semibold text-gray-900">
            {new Date(application.interview_date).toLocaleString('en-AU', {
              weekday: 'short', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
          {application.interview_notes && (
            <p className="text-xs text-gray-600 mt-1 flex items-start gap-1">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{application.interview_notes}</span>
            </p>
          )}
        </div>
      )}

      <p className="text-xs font-medium text-gray-700 mb-1.5 mt-3">Your submission:</p>

      {application.resume && (
        <button
          type="button"
          onClick={() => openFile(application.resume)}
          className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 mb-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
          <span className="flex-1 text-left">View resume</span>
        </button>
      )}

      {application.cover_letter && (
        <button
          type="button"
          onClick={() => openFile(application.cover_letter)}
          className="w-full flex items-center gap-2 p-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs text-gray-700 mb-1.5"
        >
          <FileText className="w-3.5 h-3.5 text-primary-600 flex-shrink-0" />
          <span className="flex-1 text-left">View cover letter</span>
        </button>
      )}

      {application.cover_note && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 mt-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Cover note</p>
          <p className="text-xs text-gray-600 line-clamp-3">{application.cover_note}</p>
        </div>
      )}

      <button
        onClick={onGoToDashboard}
        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg transition text-sm mt-2"
      >
        Go to Dashboard
      </button>
    </div>
  )
}


const DetailItem = ({ icon: Icon, label, value, capitalize }) => (
  <div className="flex items-start gap-2">
    <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={'text-sm font-medium text-gray-900 ' + (capitalize ? 'capitalize' : '')}>
        {value}
      </p>
    </div>
  </div>
)

export default JobDetail