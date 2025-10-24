import React, { useState } from 'react'
import { BASE_URL } from '../config'

export default function CreateInstitutionAdmin() {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const token = localStorage.getItem('token')
      if (!token) throw new Error('You must be signed in as SuperAdmin')

      const body = {
        fullname: { firstname, lastname },
        username,
        email,
        password,
        role: 'institution_admin',
      }

      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setInfo('Institution Admin created successfully')
      // clear form
      setFirstname('')
      setLastname('')
      setUsername('')
      setEmail('')
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <h2>Create Institution Admin (SuperAdmin only)</h2>
      <form onSubmit={submit}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>First name</label>
            <input value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label>Last name</label>
            <input value={lastname} onChange={(e) => setLastname(e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginTop: 8 }}>
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Institution Admin'}</button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {info && <div style={{ color: 'green', marginTop: 12 }}>{info}</div>}
    </div>
  )
}
