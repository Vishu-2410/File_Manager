import React, { useEffect, useState } from 'react'
import API from '../api'
import FileCard from '../components/FileCard'
import ShareModal from '../components/ShareModal'

export default function Dashboard({ user, setUser }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [showShare, setShowShare] = useState(false)
  const [search, setSearch] = useState('')

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const res = await API.get('/files', { params: { search } })
      setFiles(res.data.files)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => { fetchFiles() }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const form = new FormData()
    form.append('file', file)
    try {
      await API.post('/files/upload', form)
      fetchFiles()
    } catch (err) { console.error(err) }
  }

  const openShare = (file) => { setSelectedFile(file); setShowShare(true) }
  const closeShare = () => { setSelectedFile(null); setShowShare(false) }

  const logout = () => { 
    localStorage.removeItem('token'); 
    localStorage.removeItem('user'); 
    setUser(null) 
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-center sm:text-left">Dashboard</h1>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">

          <div className="flex w-full sm:w-auto gap-2">
            <input 
              value={search}
              onChange={e=>setSearch(e.target.value)} 
              placeholder="Search files"
              className="p-2 border rounded w-full sm:w-48"
            />
            <button 
              onClick={fetchFiles}
              className="px-4 py-2 bg-green-600 text-white rounded whitespace-nowrap"
            >
              Search
            </button>
          </div>

          <label className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer w-full sm:w-auto text-center">
            Upload
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>

          <button 
            onClick={logout}
            className="px-4 py-2 border border-gray-400 text-gray-700 rounded w-full sm:w-auto"
          >
            Logout
          </button>

        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="text-center py-10 text-lg text-gray-600">Loading files...</div>
      )}

      {/* Files Grid */}
      {!loading && (
        files.length === 0 ? (
          <div className="text-center text-gray-500 py-10 text-lg">
            No files found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map(f => (
              <FileCard 
                key={f._id} 
                file={f} 
                onShare={() => openShare(f)} 
                onRefresh={fetchFiles} 
                currentUser={user} 
              />
            ))}
          </div>
        )
      )}

      {/* Share Modal */}
      {showShare && (
        <ShareModal 
          file={selectedFile} 
          onClose={closeShare} 
          onShared={fetchFiles} 
        />
      )}

    </div>
  )
}
