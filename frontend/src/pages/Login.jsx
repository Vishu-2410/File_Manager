import React, { useState } from 'react'
import API from '../api'

export default function Login({ setUser }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const handle = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErr('')
    try {
      const res = await API.post('/auth/login', { username, password })
      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
    } catch (error) {
      setErr(error?.response?.data?.message || 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handle} className="bg-white p-6 rounded shadow w-full max-w-sm">
        <h2 className="text-xl font-semibold mb-4">Login</h2>
        {err && <div className="text-red-500 mb-2">{err}</div>}
        <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" className="w-full p-2 border rounded mb-3" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 border rounded mb-3" />
        <button disabled={loading} className="w-full py-2 bg-blue-600 text-white rounded">{loading? 'Signing in...':'Sign in'}</button>
      </form>
    </div>
  )
}
