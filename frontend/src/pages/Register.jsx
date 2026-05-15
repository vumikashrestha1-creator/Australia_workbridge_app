// =============================================================
// pages/Register.jsx
// PURPOSE: User registration with role-based fields
//
// FLOW:
//   1. User picks role (student or employer) — tabs at top
//   2. Form shows different fields based on role:
//      Student  → visa type + university
//      Employer → company name + ABN
//   3. On submit — calls register() from AuthContext
//   4. On success — saves tokens + redirects to dashboard
//   5. On failure — shows validation errors from backend
// =============================================================

import { useState }            from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import {
  Mail, Lock, User, GraduationCap,
  Building2, Loader2,
}                              from 'lucide-react'

const Register = () => {
  const { register }  = useAuth()
  const navigate      = useNavigate()

  // ─── ROLE TAB STATE ───────────────────────────────────────
  // Default to student because that's our primary user
  const [role, setRole] = useState('student')

  // ─── COMMON FORM FIELDS ───────────────────────────────────
  const [fullName,  setFullName]  = useState('')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')

  // ─── STUDENT-ONLY FIELDS ──────────────────────────────────
  const [visaType,   setVisaType]   = useState('500')
  const [university, setUniversity] = useState('')

  // ─── EMPLOYER-ONLY FIELDS ─────────────────────────────────
  const [companyName, setCompanyName] = useState('')
  const [abn,         setAbn]         = useState('')

  // ─── UI STATE ─────────────────────────────────────────────
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // ─── HANDLE FORM SUBMISSION ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation
    if (password !== password2) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Build payload based on role
      const payload = {
        email,
        full_name: fullName,
        password,
        password2,
        role,
      }

      if (role === 'student') {
        payload.visa_type  = visaType
        payload.university = university
      } else {
        payload.company_name = companyName
        payload.abn          = abn
      }

      // Call register from AuthContext (saves tokens automatically)
      const user = await register(payload)

      // Redirect based on role
      if (user.role === 'employer')  navigate('/employer/dashboard')
      else                           navigate('/student/dashboard')

    } catch (err) {
      // Backend may return field-specific errors
      const data = err.response?.data
      if (data) {
        // Show first error message found
        const firstError = Object.values(data).flat()[0]
        setError(firstError || 'Registration failed. Please try again.')
      } else {
        setError('Could not connect to server. Is backend running?')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">

        {/* ─── HEADER ─────────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Create your account
          </h1>
          <p className="text-gray-600 mt-2">
            Join WorkBridge in less than a minute
          </p>
        </div>

        {/* ─── REGISTER CARD ──────────────────────────────── */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">

          {/* ── ROLE TABS ───────────────────────────────── */}
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition ${
                role === 'student'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              I'm a Student
            </button>
            <button
              type="button"
              onClick={() => setRole('employer')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium text-sm transition ${
                role === 'employer'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-4 h-4" />
              I'm an Employer
            </button>
          </div>

          {/* ── FORM ─────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Jane Smith"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            {/* ── STUDENT-ONLY FIELDS ──────────────────── */}
            {role === 'student' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Visa type
                  </label>
                  <select
                    value={visaType}
                    onChange={(e) => setVisaType(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  >
                    <option value="500">Student Visa (500)</option>
                    <option value="485">Graduate Visa (485)</option>
                    <option value="417">Working Holiday (417)</option>
                    <option value="pr">Permanent Resident</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    University
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                    placeholder="University of Sydney"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>
              </>
            )}

            {/* ── EMPLOYER-ONLY FIELDS ─────────────────── */}
            {role === 'employer' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company name
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                    placeholder="TechStart Australia"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ABN (Australian Business Number)
                  </label>
                  <input
                    type="text"
                    value={abn}
                    onChange={(e) => setAbn(e.target.value)}
                    required
                    placeholder="12 345 678 901"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                  />
                </div>
              </>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register