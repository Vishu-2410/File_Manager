import React from 'react'
import API from '../api'

export default function FileCard({ file, onShare, onRefresh, currentUser }) {
  const download = async () => {
    try {
      const res = await API.get(`/files/download/${file._id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = file.originalName
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) { console.error(err) }
  }

  const del = async () => {
    if (!confirm('Delete file?')) return
    try { await API.delete(`/files/${file._id}`); onRefresh(); } catch (err) { console.error(err) }
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <div className="text-sm text-gray-500">Owner: {file.owner?.username || 'Unknown'}</div>
      <div className="font-medium">{file.originalName}</div>
      <div className="text-xs mt-2">{(file.size/1024).toFixed(1)} KB — {file.mimetype}</div>
      <div className="flex gap-2 mt-3">
        <button onClick={download} className="px-2 py-1 border rounded">Download</button>
        <button onClick={onShare} className="px-2 py-1 border rounded">Share</button>
        {(currentUser.role==='admin' || currentUser.id===file.owner?._id) && (
          <button onClick={del} className="px-2 py-1 border rounded text-red-600">Delete</button>
        )}
      </div>
    </div>
  )
}
