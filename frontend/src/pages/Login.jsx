// =============================================================
// pages/Login.jsx
// PURPOSE: User login screen
//
// FLOW:
//   1. User enters email + password
//   2. Form calls login() from AuthContext
//   3. AuthContext calls authApi.login() → Django backend
//   4. On success — save tokens + redirect to dashboard
//   5. On failure — show error message
// =============================================================

import { useState }            from 'react'
import { Link, useNavigate }   from 'react-router-dom'
import { useAuth }             from '../context/AuthContext'
import { Mail, Lock, Loader2 } from 'lucide-react'

const Login = () => {
  const { login }      = useAuth()
  const navigate       = useNavigate()

  // Form state
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Call login from AuthContext (saves tokens automatically)
      const user = await login(email, password)

      // Redirect based on role
      if (user.role === 'admin')          navigate('/admin')
      else if (user.role === 'employer')  navigate('/employer/dashboard')
      else                                navigate('/student/dashboard')

    } catch (err) {
      // Show error from backend or generic message
      const message =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        'Invalid email or password. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full">

        {/* ─── HEADER ─────────────────────────────────── */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back
          </h1>
          <p className="text-gray-600 mt-2">
            Sign in to continue your job search
          </p>
        </div>

        {/* ─── LOGIN CARD ─────────────────────────────── */}
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Email field */}
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

            {/* Password field */}
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
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-semibold py-2.5 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login