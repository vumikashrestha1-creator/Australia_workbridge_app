// =============================================================
// pages/AdminDashboard.jsx
// PURPOSE: Full admin panel with:
//   - Overview stats + pipeline charts
//   - Users tab: view, edit, change password, delete
//   - Jobs tab: view, change status, delete
// =============================================================

import { useEffect, useState } from 'react'
import {
  Users, Briefcase, FileText, Star, Trash2, Loader2,
  GraduationCap, Building2, Shield, TrendingUp, Clock,
  CheckCircle2, XCircle, Calendar, Edit, Key, X, Save,
} from 'lucide-react'
import adminApi from '../api/adminApi'
import jobsApi from '../api/jobsApi'
import api from '../api/axios'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Edit user modal state
  const [editUser, setEditUser] = useState(null)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')

  // Change password modal state
  const [pwUser, setPwUser] = useState(null)
  const [newPassword, setNewPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError('')
    try {
      const [statsData, usersData] = await Promise.all([
        adminApi.stats(),
        adminApi.listUsers(),
      ])
      setStats(statsData)
      setUsers(usersData)
      try {
        const jobsData = await jobsApi.getAll()
        setJobs(jobsData)
      } catch {
        setJobs([])
      }
    } catch (err) {
      console.error('Admin error:', err.response?.data || err.message)
      setError('Could not load admin data. Check Django terminal for errors.')
    } finally {
      setLoading(false)
    }
  }

  // ─── DELETE USER ─────────────────────────────────────
  const handleDeleteUser = async (userId, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      const s = await adminApi.stats()
      setStats(s)
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete user.')
    }
  }

  // ─── OPEN EDIT USER MODAL ────────────────────────────
  const openEditUser = (user) => {
    setEditUser(user)
    setEditForm({
      full_name:    user.full_name || '',
      email:        user.email || '',
      visa_type:    user.visa_type || '',
      university:   user.university || '',
      company_name: user.company_name || '',
      abn:          user.abn || '',
    })
    setEditError('')
  }

  // ─── SAVE EDIT USER ──────────────────────────────────
  const handleSaveEdit = async () => {
    setEditLoading(true)
    setEditError('')
    try {
      const response = await api.put(`/auth/admin/users/${editUser.id}/`, editForm)
      setUsers((prev) =>
        prev.map((u) => (u.id === editUser.id ? response.data : u))
      )
      setEditUser(null)
    } catch (err) {
      setEditError(
        err.response?.data?.error ||
        JSON.stringify(err.response?.data) ||
        'Could not update user.'
      )
    } finally {
      setEditLoading(false)
    }
  }

  // ─── CHANGE PASSWORD ─────────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      setPwError('Password must be at least 8 characters.')
      return
    }
    setPwLoading(true)
    setPwError('')
    try {
      await api.post(`/auth/admin/users/${pwUser.id}/set-password/`, {
        password: newPassword,
      })
      setPwSuccess(true)
      setNewPassword('')
      setTimeout(() => {
        setPwUser(null)
        setPwSuccess(false)
      }, 2000)
    } catch (err) {
      setPwError(
        err.response?.data?.error ||
        err.response?.data?.password?.[0] ||
        'Could not change password.'
      )
    } finally {
      setPwLoading(false)
    }
  }

  // ─── DELETE JOB ──────────────────────────────────────
  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Delete job "${title}"? This cannot be undone.`)) return
    try {
      await adminApi.deleteJob(jobId)
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
      const s = await adminApi.stats()
      setStats(s)
    } catch {
      alert('Could not delete job.')
    }
  }

  // ─── CHANGE JOB STATUS ───────────────────────────────
  const handleJobStatusChange = async (jobId, newStatus) => {
    try {
      const response = await api.put(`/jobs/${jobId}/edit/`, { status: newStatus })
      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: response.data.status } : j))
      )
    } catch {
      alert('Could not update job status.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* HEADER */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600">Platform-wide management and oversight</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mt-4 mb-2">
          {error}
          <button onClick={loadData} className="ml-3 underline font-medium">
            Retry
          </button>
        </div>
      )}

      {/* TABS */}
      <div className="border-b border-gray-200 mt-6 mb-6">
        <nav className="flex gap-6">
          {['overview', 'users', 'jobs'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'pb-3 px-1 text-sm font-medium border-b-2 transition capitalize ' +
                (activeTab === tab
                  ? 'text-primary-600 border-primary-600'
                  : 'text-gray-500 border-transparent hover:text-gray-700')
              }
            >
              {tab === 'users' ? `Users (${users.length})` :
               tab === 'jobs'  ? `Jobs (${jobs.length})` :
               'Overview'}
            </button>
          ))}
        </nav>
      </div>

      {/* ── OVERVIEW TAB ───────────────────────────────── */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users}     label="Total Users"   value={stats.total_users}        color="primary" />
            <StatCard icon={Briefcase} label="Active Jobs"   value={stats.active_jobs}        sub={`of ${stats.total_jobs} total`} color="green" />
            <StatCard icon={FileText}  label="Applications"  value={stats.total_applications} color="amber" />
            <StatCard icon={Star}      label="Reviews"       value={stats.total_reviews}      color="purple" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Breakdown</h2>
              <BreakdownRow icon={GraduationCap} label="Students"  value={stats.total_students}  total={stats.total_users} color="blue" />
              <BreakdownRow icon={Building2}     label="Employers" value={stats.total_employers} total={stats.total_users} color="green" />
              <BreakdownRow icon={Shield}        label="Admins"
                value={stats.total_users - stats.total_students - stats.total_employers}
                total={stats.total_users} color="purple" />
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Pipeline</h2>
              <BreakdownRow icon={Clock}        label="Pending"     value={stats.pending_applications}     total={stats.total_applications} color="gray" />
              <BreakdownRow icon={TrendingUp}   label="Shortlisted" value={stats.shortlisted_applications} total={stats.total_applications} color="amber" />
              <BreakdownRow icon={Calendar}     label="Interview"   value={stats.interview_applications}   total={stats.total_applications} color="blue" />
              <BreakdownRow icon={CheckCircle2} label="Offered"     value={stats.offered_applications}     total={stats.total_applications} color="green" />
              <BreakdownRow icon={XCircle}      label="Rejected"    value={stats.rejected_applications}    total={stats.total_applications} color="red" />
            </div>
          </div>
        </div>
      )}

      {/* ── USERS TAB ──────────────────────────────────── */}
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-sm font-bold">
                        {u.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{u.full_name}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {/* Edit button */}
                      <button
                        onClick={() => openEditUser(u)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                        title="Edit user"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      {/* Change password button */}
                      <button
                        onClick={() => { setPwUser(u); setPwError(''); setPwSuccess(false); setNewPassword('') }}
                        className="inline-flex items-center gap-1 text-xs text-amber-600 hover:bg-amber-50 px-2 py-1 rounded"
                        title="Change password"
                      >
                        <Key className="w-3.5 h-3.5" />
                        Password
                      </button>
                      {/* Delete button — hidden for admins */}
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id, u.full_name)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                          title="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── JOBS TAB ───────────────────────────────────── */}
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
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">{j.title}</p>
                    <p className="text-xs text-gray-500">{j.location} • {j.job_type} • {j.hours_per_week} hrs/week</p>
                    {j.visa_sponsored && (
                      <span className="text-xs text-green-600 font-medium">✓ Visa Friendly</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {j.employer_details?.company_name || j.employer_details?.full_name}
                  </td>
                  <td className="px-4 py-3">
                    {/* Inline status change dropdown */}
                    <select
                      value={j.status}
                      onChange={(e) => handleJobStatusChange(j.id, e.target.value)}
                      className={
                        'text-xs font-medium px-2 py-1 rounded-full border-0 outline-none cursor-pointer ' +
                        (j.status === 'active' ? 'bg-green-50 text-green-700' :
                         j.status === 'closed' ? 'bg-gray-100 text-gray-600' :
                         'bg-amber-50 text-amber-700')
                      }
                    >
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="draft">Draft</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteJob(j.id, j.title)}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── EDIT USER MODAL ────────────────────────────── */}
      {editUser && (
        <Modal title={`Edit User — ${editUser.full_name}`} onClose={() => setEditUser(null)}>
          {editError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
              {editError}
            </div>
          )}
          <div className="space-y-3">
            <FormField label="Full Name" value={editForm.full_name}
              onChange={(v) => setEditForm({ ...editForm, full_name: v })} />
            <FormField label="Email" type="email" value={editForm.email}
              onChange={(v) => setEditForm({ ...editForm, email: v })} />
            {editUser.role === 'student' && (
              <>
                <FormField label="University" value={editForm.university}
                  onChange={(v) => setEditForm({ ...editForm, university: v })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
                  <select
                    value={editForm.visa_type}
                    onChange={(e) => setEditForm({ ...editForm, visa_type: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select visa type</option>
                    <option value="500">Student Visa 500</option>
                    <option value="485">Graduate Visa 485</option>
                    <option value="417">Working Holiday 417</option>
                    <option value="pr">Permanent Resident</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}
            {editUser.role === 'employer' && (
              <>
                <FormField label="Company Name" value={editForm.company_name}
                  onChange={(v) => setEditForm({ ...editForm, company_name: v })} />
                <FormField label="ABN" value={editForm.abn}
                  onChange={(v) => setEditForm({ ...editForm, abn: v })} />
              </>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSaveEdit}
              disabled={editLoading}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              onClick={() => setEditUser(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}

      {/* ── CHANGE PASSWORD MODAL ──────────────────────── */}
      {pwUser && (
        <Modal title={`Change Password — ${pwUser.full_name}`} onClose={() => setPwUser(null)}>
          {pwError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-3">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Password changed successfully!
            </div>
          )}
          <div className="space-y-3">
            <FormField
              label="New Password"
              type="password"
              value={newPassword}
              onChange={setNewPassword}
              placeholder="Min 8 characters"
            />
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleChangePassword}
              disabled={pwLoading || !newPassword}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-medium py-2 rounded-lg text-sm flex items-center justify-center gap-1"
            >
              {pwLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Change Password
            </button>
            <button
              onClick={() => setPwUser(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}


// ─── REUSABLE SUB-COMPONENTS ─────────────────────────────────

const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>
      </div>
      {children}
    </div>
  </div>
)

const FormField = ({ label, value, onChange, type = 'text', placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500"
    />
  </div>
)

const StatCard = ({ icon: Icon, label, value, sub, color }) => {
  const colorMap = {
    primary: 'bg-primary-100 text-primary-700',
    green:   'bg-green-100 text-green-700',
    amber:   'bg-amber-100 text-amber-700',
    purple:  'bg-purple-100 text-purple-700',
  }
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className={'w-10 h-10 rounded-lg flex items-center justify-center mb-3 ' + (colorMap[color] || colorMap.primary)}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

const BreakdownRow = ({ icon: Icon, label, value, total, color }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0
  const colorMap = {
    blue: 'bg-blue-500', green: 'bg-green-500', purple: 'bg-purple-500',
    gray: 'bg-gray-400', amber: 'bg-amber-500', red: 'bg-red-500',
  }
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1">
        <span className="flex items-center gap-1.5 text-sm text-gray-700">
          <Icon className="w-4 h-4 text-gray-500" />
          {label}
        </span>
        <span className="text-sm font-medium text-gray-900">
          {value} <span className="text-xs text-gray-400">({pct}%)</span>
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={'h-full rounded-full ' + (colorMap[color] || 'bg-blue-500')} style={{ width: pct + '%' }} />
      </div>
    </div>
  )
}

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