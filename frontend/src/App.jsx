// =============================================================
// App.jsx
// PURPOSE: Root component — defines all page routes
// =============================================================

import { Routes, Route }      from 'react-router-dom'
import Navbar                 from './components/Navbar'
import Home                   from './pages/Home'
import Login                  from './pages/Login'
import Register               from './pages/Register'
import JobListings            from './pages/JobListings'
import JobDetail              from './pages/JobDetail'
import StudentDashboard       from './pages/StudentDashboard'
import EmployerDashboard      from './pages/EmployerDashboard'
import PostJob                from './pages/PostJob'
import EditJob                from './pages/EditJob'
import JobApplicants          from './pages/JobApplicants'
import Profile                from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/"          element={<Home />}         />
        <Route path="/login"     element={<Login />}        />
        <Route path="/register"  element={<Register />}     />
        <Route path="/jobs"      element={<JobListings />}  />
        <Route path="/jobs/:id"  element={<JobDetail />}    />

        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/profile"           element={<Profile />}          />

        {/* Employer */}
        <Route path="/employer/dashboard"             element={<EmployerDashboard />} />
        <Route path="/employer/post-job"              element={<PostJob />}           />
        <Route path="/employer/job/:id/edit"          element={<EditJob />}           />
        <Route path="/employer/job/:jobId/applicants" element={<JobApplicants />}     />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        
      </Routes>
    </div>
  )
}

export default App