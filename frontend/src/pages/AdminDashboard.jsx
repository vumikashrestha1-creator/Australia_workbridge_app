// =============================================================
// pages/AdminDashboard.jsx
// PURPOSE: Admin platform management interface
// Three tabs:
//   - Overview: Platform-wide stats + breakdown bars
//   - Users:    Table of all users with delete action
//   - Jobs:     Table of all jobs with delete action
// =============================================================

import { useEffect, useState } from 'react'
import {
  Users,
  Briefcase,
  FileText,
  Star,
  Trash2,
  Loader2,
  GraduationCap,
  Building2,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
} from 'lucide-react'
import adminApi from '../api/adminApi'
import jobsApi from '../api/jobsApi'


const AdminDashboard = () => {

  // ─── STATE ───────────────────────────────────────────
  // Currently visible tab
  const [activeTab, setActiveTab] = useState('overview')

  // Data fetched from backend
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')


  // ─── LIFECYCLE ───────────────────────────────────────
  // Run loadData() once when component mounts
  useEffect(() => {
    loadData()
  }, [])


  // ─── DATA FETCHING ───────────────────────────────────
  // Pulls stats, users, and jobs in parallel for performance
  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      // Fetch stats and users in parallel
      const [statsData, usersData] = await Promise.all([
        adminApi.stats(),
        adminApi.listUsers(),
      ])
      setStats(statsData)
      setUsers(usersData)

      // Fetch all jobs separately — uses admin endpoint
      try {
        const jobsData = await jobsApi.getAll()
        setJobs(jobsData)
      } catch {
        // Jobs tab will just be empty if this fails
        setJobs([])
      }
    } catch (err) {
      console.error('Admin load error:', err.response?.data || err.message)
      setError('Could not load admin data. Make sure you are logged in as admin.')
    } finally {
      setLoading(false)
    }
  }


  // ─── ACTIONS ─────────────────────────────────────────
  // Delete a user (with confirmation prompt)
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return

    try {
      await adminApi.deleteUser(userId)
      // Optimistic update — remove from local state without refetching
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      // Refresh stats since user count changed
      const newStats = await adminApi.stats()
      setStats(newStats)
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not delete user.'
      alert(msg)
    }
  }

  // Delete a job (admin override — works for any job)
  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Delete job "${title}"? This cannot be undone.`)) return

    try {
      await adminApi.deleteJob(jobId)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      const newStats = await adminApi.stats()
      setStats(newStats)
    } catch {
      alert('Could not delete job.')
    }
  }


  // ─── EARLY RETURNS ───────────────────────────────────
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }


  // ─── RENDER ──────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* PAGE HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">
            Platform-wide management and oversight
          </p>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4 mb-2">
          {error}
        </div>
      )}

      {/* TAB NAVIGATION */}
      <div className="border-b border-gray-200 mt-6 mb-6">
        <nav className="flex gap-6">
          <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
            Overview
          </TabButton>
          <TabButton active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            Users ({users.length})
          </TabButton>
          <TabButton active={activeTab === 'jobs'} onClick={() => setActiveTab('jobs')}>
            Jobs ({jobs.length})
          </TabButton>
        </nav>
      </div>

      {/* OVERVIEW TAB — stats and breakdowns */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">

          {/* Top-level stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Users"   value={stats.total_users}        color="primary" />
            <StatCard icon={Briefcase} label="Active Jobs"   value={stats.active_jobs}        sub={`of ${stats.total_jobs} total`} color="green" />
            <StatCard icon={FileText}  label="Applications"  value={stats.total_applications} color="amber" />
            <StatCard icon={Star}      label="Reviews"       value={stats.total_reviews}      color="purple" />
          </div>

          {/* Two-column breakdown section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* User breakdown by role */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                User Breakdown
              </h2>
              <BreakdownRow icon={GraduationCap} label="Students"  value={stats.total_students}  total={stats.total_users} color="blue" />
              <BreakdownRow icon={Building2}     label="Employers" value={stats.total_employers} total={stats.total_users} color="green" />
              <BreakdownRow icon={Shield}        label="Admins"    value={stats.total_users - stats.total_students - stats.total_employers} total={stats.total_users} color="purple" />
            </div>

            {/* Application pipeline by status */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Application Pipeline
              </h2>
              <BreakdownRow icon={Clock}         label="Pending"     value={stats.pending_applications}     total={stats.total_applications} color="gray" />
              <BreakdownRow icon={TrendingUp}    label="Shortlisted" value={stats.shortlisted_applications} total={stats.total_applications} color="amber" />
              <BreakdownRow icon={Calendar}      label="Interview"   value={stats.interview_applications}   total={stats.total_applications} color="blue" />
              <BreakdownRow icon={CheckCircle2}  label="Offered"     value={stats.offered_applications}     total={stats.total_applications} color="green" />
              <BreakdownRow icon={XCircle}       label="Rejected"    value={stats.rejected_applications}    total={stats.total_applications} color="red" />
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB — table with delete action */}
      {activeTab === 'users' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Details</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">

                  {/* User identity */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {u.full_name?.charAt(0) || u.email?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role badge */}
                  <td className="px-4 py-3">
                    <RoleBadge role={u.role} />
                  </td>

                  {/* Role-specific details */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {u.role === 'student' && (
                      <>
                        {u.university && <p>{u.university}</p>}
                        {u.visa_type && <p className="text-xs text-blue-600">Visa {u.visa_type}</p>}
                      </>
                    )}
                    {u.role === 'employer' && (
                      <>
                        {u.company_name && <p>{u.company_name}</p>}
                        {u.abn && <p className="text-xs text-gray-500">ABN: {u.abn}</p>}
                      </>
                    )}
                  </td>

                  {/* Delete button (hidden for admins) */}
                  <td className="px-4 py-3 text-right">
                    {u.role !== 'admin' && (
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* JOBS TAB — table with delete action */}
      {activeTab === 'jobs' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Job</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">

                  {/* Job title + meta */}
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{j.title}</p>
                    <p className="text-xs text-gray-500">
                      {j.location} • {j.job_type}
                    </p>
                  </td>

                  {/* Employer name */}
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {j.employer_details?.company_name || j.employer_details?.full_name}
                  </td>

                  {/* Active/inactive badge */}
                  <td className="px-4 py-3">
                    {j.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Delete button */}
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteJob(j.id, j.title)}
                      className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}


// =============================================================
// SUB-COMPONENTS
// Kept in same file for simplicity (small, only used here)
// =============================================================

// Tab navigation button with active/inactive styling
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      'pb-3 px-1 text-sm font-medium border-b-2 transition ' +
      (active
        ? 'text-primary-600 border-primary-600'
        : 'text-gray-500 border-transparent hover:text-gray-700')
    }
  >
    {children}
  </button>
)


// Single stat card — icon, big number, label, optional subtitle
const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  // Color mapping to Tailwind classes
  const colorMap = {
    primary: 'bg-primary-100 text-primary-700',
    green:   'bg-green-100 text-green-700',
    amber:   'bg-amber-100 text-amber-700',
    purple:  'bg-purple-100 text-purple-700',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={
        'w-10 h-10 rounded-lg flex items-center justify-center mb-3 ' +
        (colorMap[color] || colorMap.primary)
      }>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}


// Single breakdown row with progress bar showing % of total
const BreakdownRow = ({ icon: Icon, label, value, total, color }) => {
  // Calculate percentage, guarding against division by zero
  const pct = total > 0 ? Math.round((value / total) * 100) : 0

  const colorMap = {
    blue:   'bg-blue-500',
    green:  'bg-green-500',
    purple: 'bg-purple-500',
    gray:   'bg-gray-500',
    amber:  'bg-amber-500',
    red:    'bg-red-500',
  }

  return (
    <div className="mb-3 last:mb-0">
      {/* Label + count line */}
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-sm text-gray-700">
          <Icon className="w-4 h-4 text-gray-500" />
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {value} <span className="text-xs text-gray-400">({pct}%)</span>
        </span>
      </div>

      {/* Visual progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={'h-full rounded-full ' + (colorMap[color] || colorMap.blue)}
          style={{ width: pct + '%' }}
        />
      </div>
    </div>
  )
}


// Color-coded badge showing user role
const RoleBadge = ({ role }) => {
  const config = {
    student:  { label: 'Student',  cls: 'bg-blue-50 text-blue-700' },
    employer: { label: 'Employer', cls: 'bg-green-50 text-green-700' },
    admin:    { label: 'Admin',    cls: 'bg-purple-50 text-purple-700' },
  }
  const item = config[role] || config.student
  return (
    <span className={'inline-flex px-2 py-0.5 rounded-full text-xs font-medium ' + item.cls}>
      {item.label}
    </span>
  )
}


export default AdminDashboard