import React, { useState } from 'react'
import { BASE_URL } from '../config'

export default function Register({ onSuccess }) {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('institution_admin')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)
    try {
      const body = {
        fullname: { firstname, lastname },
        username,
        email,
        password,
        role,
      }
      const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // include token if present (for creating institution_admin as superadmin)
          ...(localStorage.getItem('token') ? { Authorization: `Bearer ${localStorage.getItem('token')}` } : {}),
        },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`)
      setInfo('Account created successfully')
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h2>Register</h2>
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
        <div style={{ marginTop: 8 }}>
          <label>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="institution_admin">Institution Admin</option>
            <option value="superadmin">SuperAdmin</option>
          </select>
          <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
            Note: creating a <strong>superadmin</strong> is restricted; use the server env SUPERADMIN_* to pre-create one or be authenticated as superadmin.
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 12 }}>{error}</div>}
      {info && <div style={{ color: 'green', marginTop: 12 }}>{info}</div>}
    </div>
  )
}
