import React, { useState, useEffect, useRef } from 'react'
import { useSocket } from '../hooks/useSocket'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import MessageBubble from './MessageBubble'

export default function ChatWindow({ room, onlineUsers }) {
  const { user } = useAuth()
  const { getSocket } = useSocket()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const [aiLoading, setAiLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const bottomRef = useRef(null)
  const typingTimeout = useRef(null)

  useEffect(() => {
    if (!room) return
    setMessages([])
    setTypingUsers([])
    setLoadingHistory(true)
    api.get(`/messages/${room._id}`)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoadingHistory(false))
  }, [room])

  useEffect(() => {
    if (!room) return
    const socket = getSocket()
    socket.emit('join_room', { roomId: room._id })

    function handleNewMessage(msg) {
      if (msg.room !== room._id) return
      setAiLoading(false)
      setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg])
    }
    function handleTyping({ username, roomId }) {
      if (roomId !== room._id || username === user.username) return
      setTypingUsers(prev => prev.includes(username) ? prev : [...prev, username])
    }
    function handleStopTyping({ roomId }) {
      if (roomId !== room._id) return
      setTypingUsers([])
    }

    socket.on('new_message', handleNewMessage)
    socket.on('user_typing', handleTyping)
    socket.on('user_stop_typing', handleStopTyping)

    return () => {
      socket.off('new_message', handleNewMessage)
      socket.off('user_typing', handleTyping)
      socket.off('user_stop_typing', handleStopTyping)
    }
  }, [room])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingUsers, aiLoading])

  function handleSend() {
    if (!input.trim() || !room) return
    if (room.isAI) setAiLoading(true)
    const socket = getSocket()
    socket.emit('send_message', { roomId: room._id, content: input.trim() })
    socket.emit('stop_typing', { roomId: room._id })
    setInput('')
    clearTimeout(typingTimeout.current)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleInputChange(e) {
    setInput(e.target.value)
    const socket = getSocket()
    socket.emit('typing', { roomId: room._id, username: user.username })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop_typing', { roomId: room._id })
    }, 1500)
  }

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#09081a]">
        <div className="text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="text-xl font-semibold text-gray-300 mb-2">Welcome to ChatFlow</h2>
          <p className="text-gray-600 text-sm">Select a room to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-[#09081a] min-w-0">
      <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3 bg-[#110f25]/50">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
          room.isAI ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-[#1a1730] border border-white/10'
        }`}>
          {room.isAI ? '🤖' : '#'}
        </div>
        <div>
          <h2 className="font-semibold text-white text-sm">{room.name}</h2>
          <p className="text-xs text-gray-500">{room.isAI ? 'AI Assistant · Always online' : `${onlineUsers.size} online`}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {loadingHistory && (
          <div className="flex justify-center">
            <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loadingHistory && messages.length === 0 && (
          <div className="text-center py-10">
            <div className="text-3xl mb-3">{room.isAI ? '🤖' : '👋'}</div>
            <p className="text-gray-500 text-sm">
              {room.isAI ? "Ask ChatBot anything! It's powered by Claude AI." : `Say hello in #${room.name}!`}
            </p>
          </div>
        )}
        {messages.map(msg => <MessageBubble key={msg._id} message={msg} />)}

        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1a1730] rounded-full flex items-center justify-center text-xs text-gray-400">
              {typingUsers[0]?.slice(0, 2).toUpperCase()}
            </div>
            <div className="bg-[#1a1730] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
            </div>
          </div>
        )}

        {aiLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-sm">🤖</div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              <span className="text-xs text-emerald-400 ml-1">thinking...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-6 py-4 border-t border-white/5 bg-[#110f25]/30">
        <div className="flex items-end gap-3">
          <div className="flex-1 bg-[#1a1730] border border-white/5 focus-within:border-violet-500/50 rounded-2xl px-4 py-3 transition-all">
            <textarea
              className="w-full bg-transparent text-sm text-white placeholder-gray-500 outline-none resize-none leading-relaxed"
              placeholder={room.isAI ? 'Ask ChatBot anything...' : `Message #${room.name}`}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              rows={1}
              style={{ maxHeight: '120px', overflowY: 'auto' }}
            />
          </div>
          <button onClick={handleSend} disabled={!input.trim()}
            className="w-10 h-10 bg-violet-500 hover:bg-violet-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all flex-shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
