// =============================================================
// components/Navbar.jsx
// PURPOSE: Top navigation bar shown on every page
// Adds "Profile" link for students (resume management)
// =============================================================

import { Link, useNavigate }  from 'react-router-dom'
import { useAuth }            from '../context/AuthContext'
import { Briefcase, LogOut, User } from 'lucide-react'

const Navbar = () => {
  const { user, logout, isStudent, isEmployer, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Pick the right dashboard URL based on role
  const dashboardPath =
    isAdmin    ? '/admin' :
    isEmployer ? '/employer/dashboard' :
                 '/student/dashboard'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">WorkBridge</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">

            {/* Always visible */}
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
            >
              Browse Jobs
            </Link>

            {/* Admin-only link — only visible to admin users */}
            {user?.role === 'admin' && (
              <Link
                to="/admin/dashboard"
                className="text-sm font-medium text-gray-700 hover:text-primary-600 transition"
              >
                Admin
              </Link>
            )}

            {/* Logged out */}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition"
                >
                  Sign Up
                </Link>
              </>
            )}

            {/* Logged in */}
            {user && (
              <>
                <Link
                  to={dashboardPath}
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
                >
                  Dashboard
                </Link>

                {/* Profile link — students only */}
                {isStudent && (
                  <Link
                    to="/profile"
                    className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
                    title="Manage profile and resume"
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                  <div className="w-7 h-7 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-semibold">
                    {user.full_name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user.full_name}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-gray-600 hover:text-danger transition"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar