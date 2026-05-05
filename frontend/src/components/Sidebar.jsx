import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import RoomModal from './RoomModal'

export default function Sidebar({ rooms, activeRoom, onSelectRoom, onRoomCreated, onlineUsers }) {
  const { user, logout } = useAuth()
  const { disconnectSocket } = useSocket()
  const [showModal, setShowModal] = useState(false)

  function handleLogout() {
    disconnectSocket()
    logout()
  }

  function getInitials(name) {
    return name?.slice(0, 2).toUpperCase() || '??'
  }

  return (
    <div className="w-72 flex-shrink-0 bg-[#110f25] border-r border-white/5 flex flex-col h-full">
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-violet-500 rounded-lg flex items-center justify-center text-sm">💬</div>
          <span className="font-bold text-white">ChatFlow</span>
        </div>
        <div className="flex items-center gap-3 bg-[#1a1730] rounded-xl p-3">
          <div className="w-8 h-8 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center text-xs font-bold text-violet-400">
            {getInitials(user?.username)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <button onClick={handleLogout} className="text-gray-500 hover:text-red-400 transition-colors text-sm" title="Logout">⎋</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Rooms</span>
          <button onClick={() => setShowModal(true)}
            className="w-5 h-5 bg-violet-500/20 hover:bg-violet-500/40 text-violet-400 rounded-md flex items-center justify-center text-xs transition-colors">
            +
          </button>
        </div>

        {rooms.length === 0 && (
          <p className="text-xs text-gray-600 text-center py-4">No rooms yet</p>
        )}

        {rooms.map(room => {
          const isActive = activeRoom?._id === room._id
          return (
            <button key={room._id} onClick={() => onSelectRoom(room)}
              className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
                isActive ? 'bg-violet-500/20 border border-violet-500/30' : 'hover:bg-[#1a1730] border border-transparent'
              }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${
                  room.isAI ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-[#1a1730] border border-white/5'
                }`}>
                  {room.isAI ? '🤖' : '#'}
                </div>
                <p className={`text-sm font-medium truncate ${isActive ? 'text-violet-300' : 'text-gray-300'}`}>
                  {room.name}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <div className="p-4 border-t border-white/5">
        <p className="text-xs text-gray-600 text-center">
          <span className="text-emerald-400 font-medium">{onlineUsers.size}</span> online
        </p>
      </div>

      {showModal && (
        <RoomModal onClose={() => setShowModal(false)} onRoomCreated={room => { onRoomCreated(room); setShowModal(false) }} />
      )}
    </div>
  )
}
