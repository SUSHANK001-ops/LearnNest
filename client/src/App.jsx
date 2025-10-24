import React, { useEffect, useState } from 'react'
import Login from './components/Login.jsx'
import Register from './components/Register.jsx'

const App = () => {
  const [view, setView] = useState('home') // home | login | register
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

  const token = localStorage.getItem('token')

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: 20 }}>
      <header style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>LearnNest — Auth demo</h1>
        <nav style={{ marginLeft: 'auto' }}>
          <button onClick={() => setView('home')} style={{ marginRight: 8 }}>Home</button>
          <button onClick={() => setView('login')} style={{ marginRight: 8 }}>Login</button>
          <button onClick={() => setView('register')}>Register</button>
        </nav>
      </header>

      <main style={{ marginTop: 18 }}>
        {view === 'home' && (
          <section>
            <h2>Backend test</h2>
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

            <div style={{ marginTop: 20 }}>
              <strong>Token:</strong> {token ? <span style={{ color: 'green' }}>Present</span> : <span style={{ color: 'gray' }}>Not signed in</span>}
            </div>
          </section>
        )}

        {view === 'login' && <Login onSuccess={() => setView('home')} />}
        {view === 'register' && <Register onSuccess={() => setView('login')} />}
      </main>
    </div>
  )
}

export default App