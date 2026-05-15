// =============================================================
// App.jsx
// PURPOSE: Root component — for now just a Tailwind test page
// We will replace this with proper routing in the next step
// =============================================================

function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md">
        <h1 className="text-3xl font-bold text-primary-600 mb-2">
          WorkBridge
        </h1>
        <p className="text-gray-600 mb-4">
          Visa-aware job platform for international students in Australia.
        </p>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium transition">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App