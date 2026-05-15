// =============================================================
// pages/Home.jsx
// PURPOSE: Landing page (placeholder for now)
// We will build the full hero section + featured jobs later
// =============================================================

import { Link }      from 'react-router-dom'
import { useAuth }   from '../context/AuthContext'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-primary-50 to-white px-4">
      <div className="max-w-3xl text-center">

        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Find Visa-Friendly Jobs
          <br />
          <span className="text-primary-600">in Australia</span>
        </h1>

        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          The first job platform built specifically for international
          students — filter by visa eligibility and work hour limits.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/jobs"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Browse Jobs
          </Link>
          {!user && (
            <Link
              to="/register"
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-50 px-6 py-3 rounded-lg font-semibold transition"
            >
              Sign Up Free
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home