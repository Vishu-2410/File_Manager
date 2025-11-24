import React, { useState } from 'react'
import API from '../api'

export default function ShareModal({ file, onClose, onShared }) {
  const [username, setUsername] = useState('')
  const [msg, setMsg] = useState('')

  const share = async () => {
    try {
      await API.post(`/files/share/${file._id}`, { username })
      setMsg('Shared successfully')
      onShared()
    } catch (err) {
      setMsg(err?.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h3 className="font-semibold">Share {file.originalName}</h3>
        <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username to share with" className="w-full p-2 border rounded mt-2" />
        <div className="flex gap-2 mt-3">
          <button onClick={share} className="px-3 py-1 bg-blue-600 text-white rounded">Share</button>
          <button onClick={onClose} className="px-3 py-1 border rounded">Close</button>
        </div>
        {msg && <div className="mt-2 text-sm">{msg}</div>}
      </div>
    </div>
  )
}
