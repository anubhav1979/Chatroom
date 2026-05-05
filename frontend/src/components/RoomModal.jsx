import React, { useState, useEffect } from 'react'
import api from '../api/axios'

export default function RoomModal({ onClose, onRoomCreated }) {
  const [tab, setTab] = useState('create')
  const [name, setName] = useState('')
  const [allRooms, setAllRooms] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tab === 'browse') {
      api.get('/rooms/all').then(res => setAllRooms(res.data))
    }
  }, [tab])

  async function handleCreate(e) {
    e.preventDefault()
    if (!name.trim()) return
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/rooms', { name: name.trim() })
      onRoomCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  async function handleJoin(roomId) {
    try {
      const res = await api.post(`/rooms/${roomId}/join`)
      onRoomCreated(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-white">Rooms</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-300 text-xl">×</button>
        </div>

        <div className="flex gap-1 bg-[#1a1730] rounded-xl p-1 mb-5">
          {['create', 'browse'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                tab === t ? 'bg-violet-500 text-white' : 'text-gray-400 hover:text-white'
              }`}>
              {t === 'create' ? '+ Create' : '🔍 Browse'}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-3 py-2 mb-4">{error}</div>
        )}

        {tab === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Room name</label>
              <input type="text" className="input-field" placeholder="e.g. general, dev-talk"
                value={name} onChange={e => setName(e.target.value)} autoFocus />
            </div>
            <button type="submit" disabled={loading || !name.trim()} className="btn-primary w-full">
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </form>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allRooms.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No rooms found</p>}
            {allRooms.map(room => (
              <div key={room._id} className="flex items-center gap-3 bg-[#1a1730] rounded-xl px-4 py-3">
                <span>{room.isAI ? '🤖' : '#'}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{room.name}</p>
                  <p className="text-xs text-gray-500">{room.members?.length || 0} members</p>
                </div>
                <button onClick={() => handleJoin(room._id)}
                  className="text-xs bg-violet-500/20 hover:bg-violet-500/40 text-violet-400 px-3 py-1.5 rounded-lg transition-colors">
                  Join
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
