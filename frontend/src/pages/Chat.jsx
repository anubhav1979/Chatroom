import React, { useState, useEffect } from 'react'
import { useSocket } from '../hooks/useSocket'
import api from '../api/axios'
import Sidebar from '../components/Sidebar'
import ChatWindow from '../components/ChatWindow'

export default function Chat() {
  const { getSocket } = useSocket()
  const [rooms, setRooms] = useState([])
  const [activeRoom, setActiveRoom] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState(new Set())

  useEffect(() => {
    api.get('/rooms').then(res => {
      setRooms(res.data)
      const aiRoom = res.data.find(r => r.isAI)
      if (aiRoom) setActiveRoom(aiRoom)
    })
  }, [])

  useEffect(() => {
    const socket = getSocket()
    socket.on('user_status', ({ userId, status }) => {
      setOnlineUsers(prev => {
        const next = new Set(prev)
        if (status === 'online') next.add(userId)
        else next.delete(userId)
        return next
      })
    })
    return () => socket.off('user_status')
  }, [])

  function handleRoomCreated(room) {
    setRooms(prev => prev.find(r => r._id === room._id) ? prev : [...prev, room])
    setActiveRoom(room)
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#09081a]">
      <Sidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        onRoomCreated={handleRoomCreated}
        onlineUsers={onlineUsers}
      />
      <ChatWindow room={activeRoom} onlineUsers={onlineUsers} />
    </div>
  )
}
