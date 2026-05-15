// =============================================================
// components/Navbar.jsx
// PURPOSE: Top navigation bar shown on every page
//
// SHOWS DIFFERENT LINKS BASED ON USER ROLE:
//   Logged out → Login | Register
//   Student    → Browse Jobs | Dashboard | Logout
//   Employer   → Browse Jobs | Dashboard | Logout
//   Admin      → Admin Panel | Logout
//
// USES:
//   useAuth()  — to know who is logged in
//   useNavigate() — to redirect after logout
// =============================================================

import { Link, useNavigate }  from 'react-router-dom'
import { useAuth }            from '../context/AuthContext'
import { Briefcase, LogOut }  from 'lucide-react'

const Navbar = () => {
  const { user, logout, isStudent, isEmployer, isAdmin } = useAuth()
  const navigate = useNavigate()

  // Handle logout button click
  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Get dashboard URL based on role
  const dashboardPath =
    isAdmin    ? '/admin' :
    isEmployer ? '/employer/dashboard' :
                 '/student/dashboard'

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* ─── LOGO ─────────────────────────────────── */}
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary-600 p-2 rounded-lg">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              WorkBridge
            </span>
          </Link>

          {/* ─── DESKTOP NAVIGATION ───────────────────── */}
          <div className="flex items-center gap-2 sm:gap-6">

            {/* Public links — always visible */}
            <Link
              to="/jobs"
              className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
            >
              Browse Jobs
            </Link>

            {/* ─── LOGGED-OUT VIEW ────────────────────── */}
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

            {/* ─── LOGGED-IN VIEW ─────────────────────── */}
            {user && (
              <>
                <Link
                  to={dashboardPath}
                  className="text-gray-700 hover:text-primary-600 font-medium text-sm sm:text-base"
                >
                  Dashboard
                </Link>
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