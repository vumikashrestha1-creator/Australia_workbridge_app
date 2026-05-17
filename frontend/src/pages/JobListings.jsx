// =============================================================
// pages/JobListings.jsx
// PURPOSE: Public page where students browse jobs
// Features:
//   — Search box (keyword)
//   — Filter sidebar (visa, category, location, max hours)
//   — Job cards list
//   — Loading state
//   — Empty state
//
// HD FEATURE: visa-aware filtering — this is what makes
// WorkBridge different from Seek/Indeed
// =============================================================

import { useEffect, useState }    from 'react'
import { Search, ShieldCheck, Filter, X, Loader2 } from 'lucide-react'
import jobsApi                    from '../api/jobsApi'
import JobCard                    from '../components/JobCard'

const JobListings = () => {

  // ─── DATA STATE ─────────────────────────────────────────
  const [jobs,    setJobs]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // ─── FILTER STATE ───────────────────────────────────────
  const [search,         setSearch]         = useState('')
  const [visaOnly,       setVisaOnly]       = useState(false)
  const [category,       setCategory]       = useState('')
  const [location,       setLocation]       = useState('')
  const [maxHours,       setMaxHours]       = useState('')
  const [showFilters,    setShowFilters]    = useState(true)

  // ─── FETCH JOBS WHEN FILTERS CHANGE ────────────────────
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true)
      setError('')

      try {
        // Build query params object — only include set filters
        const params = {}
        if (visaOnly) params.visa_sponsored = 'true'
        if (category) params.category       = category
        if (location) params.location       = location
        if (maxHours) params.max_hours      = maxHours
        if (search)   params.search         = search

        const data = await jobsApi.list(params)
        setJobs(data)
      } catch (err) {
        setError('Could not load jobs. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }

    // Debounce — wait 300ms after typing stops before searching
    const timer = setTimeout(fetchJobs, 300)
    return () => clearTimeout(timer)
  }, [search, visaOnly, category, location, maxHours])

  // ─── CLEAR ALL FILTERS ──────────────────────────────────
  const clearFilters = () => {
    setSearch('')
    setVisaOnly(false)
    setCategory('')
    setLocation('')
    setMaxHours('')
  }

  // Count active filters for the badge
  const activeFilterCount = [
    visaOnly, category, location, maxHours,
  ].filter(Boolean).length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ─── PAGE HEADER ────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Browse Jobs</h1>
        <p className="text-gray-600 mt-1">
          Find visa-friendly opportunities across Australia
        </p>
      </div>

      {/* ─── SEARCH BAR ─────────────────────────────────── */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by job title, keyword, or location..."
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition shadow-sm"
        />
      </div>

      {/* ─── LAYOUT — SIDEBAR + RESULTS ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* ── FILTER SIDEBAR ──────────────────────────── */}
        <aside className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-20">

            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </h2>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Visa filter — featured at top */}
            <div className="mb-5 p-3 bg-green-50 rounded-lg border border-green-100">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={visaOnly}
                  onChange={(e) => setVisaOnly(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                />
                <div>
                  <span className="font-medium text-gray-900 text-sm flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-green-600" />
                    Visa-friendly only
                  </span>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Show only employers who sponsor or welcome international students
                  </p>
                </div>
              </label>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">All categories</option>
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

            {/* Location */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sydney"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>

            {/* Max hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Max hours per week
              </label>
              <select
                value={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Any</option>
                <option value="20">Up to 20 hrs (visa safe)</option>
                <option value="24">Up to 24 hrs (visa safe)</option>
                <option value="38">Up to 38 hrs (full-time)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Student visa: max 48 hrs / fortnight
              </p>
            </div>
          </div>
        </aside>

        {/* ── JOBS LIST ──────────────────────────────────── */}
        <div>

          {/* Result count */}
          {!loading && !error && (
            <p className="text-sm text-gray-600 mb-4">
              {jobs.length} {jobs.length === 1 ? 'job' : 'jobs'} found
              {visaOnly && (
                <span className="ml-2 inline-flex items-center gap-1 text-green-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  visa-friendly
                </span>
              )}
            </p>
          )}

          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-primary-600 animate-spin mb-2" />
              <p className="text-gray-600 text-sm">Loading jobs...</p>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && jobs.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
                <X className="w-6 h-6 text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">No jobs found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Try adjusting your filters or search terms
              </p>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}

          {/* Job cards */}
          {!loading && !error && jobs.length > 0 && (
            <div className="space-y-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobListings