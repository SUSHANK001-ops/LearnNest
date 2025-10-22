import React, { useEffect, useState } from 'react'

const App = () => {
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchTest = async () => {
    setLoading(true)
    setError(null)
    try {
  // Use a relative path so Vite dev server can proxy to the backend
  const res = await fetch('/api/test')
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
      setMessage(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTest()
  }, [])

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <h1>Frontend ↔ Backend Test</h1>
      <div style={{ marginTop: 12 }}>
        <button onClick={fetchTest} disabled={loading}>
          {loading ? 'Checking...' : 'Check API'}
        </button>
      </div>
      <div style={{ marginTop: 12 }}>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
        {message && <div style={{ color: 'green' }}>{message}</div>}
      </div>
      <p style={{ marginTop: 24, color: '#666' }}>
        This component fetches <code>/api/test</code> on the backend and displays the result. The backend is expected to run at <code>http://localhost:3000</code>.
      </p>
    </div>
  )
}

export default App