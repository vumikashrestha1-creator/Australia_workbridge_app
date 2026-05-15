// =============================================================
// App.jsx
// PURPOSE: Root component — defines all page routes
// =============================================================

import { Routes, Route }  from 'react-router-dom'
import Navbar             from './components/Navbar'
import Home               from './pages/Home'
import Login              from './pages/Login'
import Register           from './pages/Register'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/"         element={<Home />}     />
        <Route path="/login"    element={<Login />}    />
        <Route path="/register" element={<Register />} />
        {/* More routes added as we build pages */}
      </Routes>
    </div>
  )
}

export default App