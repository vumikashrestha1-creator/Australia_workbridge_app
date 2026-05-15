import { Routes, Route }  from 'react-router-dom'
import Navbar             from './components/Navbar'
import Home               from './pages/Home'
import Login              from './pages/Login'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Routes>
        <Route path="/"       element={<Home />} />
        <Route path="/login"  element={<Login />} />
      </Routes>
    </div>
  )
}

export default App