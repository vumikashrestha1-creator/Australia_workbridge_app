import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  Loader2,
  Download,
  Upload,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import authApi from '../api/authApi'

const Profile = () => {
  const { user, refreshUser } = useAuth()
  const fileInputRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PDF or Word document.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB.')
      return
    }

    setError('')
    setSuccess(false)
    setUploading(true)

    try {
      const updated = await authApi.updateProfile({ resume: file })
      refreshUser(updated)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Could not upload resume. Please try again.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // Handle remove resume
  const handleRemove = async () => {
    if (!window.confirm('Remove your uploaded resume?')) return

    setUploading(true)
    setError('')
    try {
      const updated = await authApi.updateProfile({ resume: '' })
      refreshUser(updated)
    } catch {
      setError('Could not remove resume.')
    } finally {
      setUploading(false)
    }
  }

  // Open resume in new tab
  const handleViewResume = () => {
    if (user && user.resume) {
      window.open(user.resume, '_blank')
    }
  }

  const resumeFileName = user && user.resume
    ? decodeURIComponent(user.resume.split('/').pop())
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        to="/student/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-primary-600 mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {user && user.full_name ? user.full_name.charAt(0) : 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {user && user.full_name}
            </h1>
            <p className="text-gray-600">{user && user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {user && user.visa_type && (
                <span className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Visa {user.visa_type}
                </span>
              )}
              {user && user.university && (
                <span className="text-xs text-gray-500">{user.university}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          My Resume
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload once and we will attach it to every job you apply for.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-3">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resume uploaded successfully!
          </div>
        )}

        {resumeFileName ? (
          <div className="border border-gray-200 rounded-lg p-4 flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {resumeFileName}
              </p>
              <p className="text-xs text-gray-500">Currently uploaded</p>
            </div>
            <button
              type="button"
              onClick={handleViewResume}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
              title="View resume"
            >
              <Download className="w-4 h-4" />
              View
            </button>
            <button
              type="button"
              onClick={handleRemove}
              disabled={uploading}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
              title="Remove resume"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-3">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-full mb-2">
              <FileText className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-1">No resume uploaded yet</p>
            <p className="text-xs text-gray-500">PDF, DOC or DOCX - max 5 MB</p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
          disabled={uploading}
          className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              {resumeFileName ? 'Upload New Resume' : 'Upload Resume'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default Profile