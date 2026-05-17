// =============================================================
// pages/EditJob.jsx
// PURPOSE: Form for employers to edit an existing job listing
// Same UI as PostJob but pre-filled and uses PUT instead of POST
// Also includes a Delete button with confirmation
// =============================================================

import { useEffect, useState }       from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Briefcase, MapPin, Clock, DollarSign, Calendar,
  FileText, ShieldCheck, ArrowLeft, Loader2, Trash2,
}                                    from 'lucide-react'
import jobsApi                       from '../api/jobsApi'

const EditJob = () => {
  const { id }   = useParams()
  const navigate = useNavigate()

  // ─── FORM STATE ───────────────────────────────────────
  const [title,         setTitle]         = useState('')
  const [description,   setDescription]   = useState('')
  const [category,      setCategory]      = useState('technology')
  const [location,      setLocation]      = useState('')
  const [salaryRange,   setSalaryRange]   = useState('')
  const [hoursPerWeek,  setHoursPerWeek]  = useState(20)
  const [jobType,       setJobType]       = useState('part-time')
  const [visaSponsored, setVisaSponsored] = useState(true)
  const [deadline,      setDeadline]      = useState('')
  const [jobStatus,     setJobStatus]     = useState('active')

  const [initialLoading, setInitialLoading] = useState(true)
  const [saving,         setSaving]         = useState(false)
  const [deleting,       setDeleting]       = useState(false)
  const [error,          setError]          = useState('')

  // ─── FETCH EXISTING JOB DATA ──────────────────────────
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const job = await jobsApi.getById(id)
        setTitle(job.title)
        setDescription(job.description)
        setCategory(job.category)
        setLocation(job.location)
        setSalaryRange(job.salary_range || '')
        setHoursPerWeek(job.hours_per_week)
        setJobType(job.job_type)
        setVisaSponsored(job.visa_sponsored)
        setDeadline(job.deadline || '')
        setJobStatus(job.status)
      } catch {
        setError('Could not load job. Please try again.')
      } finally {
        setInitialLoading(false)
      }
    }
    fetchJob()
  }, [id])

  // ─── HANDLE UPDATE ────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await jobsApi.update(id, {
        title,
        description,
        category,
        location,
        salary_range:   salaryRange,
        hours_per_week: parseInt(hoursPerWeek),
        job_type:       jobType,
        visa_sponsored: visaSponsored,
        status:         jobStatus,
        deadline:       deadline || null,
      })
      navigate('/employer/dashboard')
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat()[0] : 'Could not update job.')
    } finally {
      setSaving(false)
    }
  }

  // ─── HANDLE DELETE ────────────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(
      'Are you sure you want to delete this job listing? This action cannot be undone.'
    )) return

    setDeleting(true)
    try {
      await jobsApi.remove(id)
      navigate('/employer/dashboard')
    } catch {
      setError('Could not delete job. Please try again.')
      setDeleting(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      <Link
        to="/employer/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit Job</h1>
            <p className="text-gray-600 text-sm">Update the details below or delete this listing</p>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex items-center gap-1 px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg transition"
          >
            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <Field icon={Briefcase} label="Job title" type="text" value={title} onChange={setTitle} required />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={6}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              />
            </div>
          </div>

          {/* Status — NEW for edit page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing status</label>
            <select
              value={jobStatus}
              onChange={(e) => setJobStatus(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
            >
              <option value="active">Active — accepting applications</option>
              <option value="closed">Closed — no longer hiring</option>
              <option value="draft">Draft — not visible to students</option>
            </select>
          </div>

          {/* Category + Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              >
                <option value="technology">Technology</option>
                <option value="hospitality">Hospitality</option>
                <option value="retail">Retail</option>
                <option value="education">Education</option>
                <option value="healthcare">Healthcare</option>
                <option value="admin">Admin &amp; Office</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job type</label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              >
                <option value="part-time">Part-time</option>
                <option value="casual">Casual</option>
                <option value="internship">Internship</option>
                <option value="full-time">Full-time</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={MapPin} label="Location" type="text" value={location} onChange={setLocation} required />
            <Field icon={Clock}  label="Hours per week" type="number" value={hoursPerWeek} onChange={setHoursPerWeek} min={1} max={50} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field icon={DollarSign} label="Salary range" type="text" value={salaryRange} onChange={setSalaryRange} />
            <Field icon={Calendar}   label="Deadline"     type="date" value={deadline}    onChange={setDeadline} />
          </div>

          {/* Visa toggle */}
          <label className="flex items-start gap-3 p-4 border border-green-200 bg-green-50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={visaSponsored}
              onChange={(e) => setVisaSponsored(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                Visa-friendly employer
              </span>
              <p className="text-xs text-gray-600 mt-0.5">
                Shown prominently to international students
              </p>
            </div>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-2"
          >
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Saving...</> : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  )
}

const Field = ({ icon: Icon, label, value, onChange, ...rest }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition`}
        {...rest}
      />
    </div>
  </div>
)

export default EditJob