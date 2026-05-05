import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function MessageBubble({ message }) {
  const { user } = useAuth()
  const isOwn = message.user?._id === user?.id || message.user?._id === user?._id
  const isAI = message.isAI

  function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  function getInitials(name) {
    return name?.slice(0, 2).toUpperCase() || '??'
  }

  if (isAI) {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 bg-emerald-500/20 border border-emerald-500/30 rounded-full flex items-center justify-center text-sm flex-shrink-0 mt-1">🤖</div>
        <div className="max-w-[75%]">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-xs font-semibold text-emerald-400">ChatBot</span>
            <span className="text-xs text-gray-600">{formatTime(message.createdAt)}</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-tl-sm px-4 py-3">
            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
      </div>
    )
  }

  if (isOwn) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[75%]">
          <div className="flex items-baseline gap-2 mb-1 justify-end">
            <span className="text-xs text-gray-600">{formatTime(message.createdAt)}</span>
            <span className="text-xs font-semibold text-violet-400">You</span>
          </div>
          <div className="bg-violet-500 rounded-2xl rounded-tr-sm px-4 py-3">
            <p className="text-sm text-white leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
          </div>
        </div>
        <div className="w-8 h-8 bg-violet-500/20 border border-violet-500/30 rounded-full flex items-center justify-center text-xs font-bold text-violet-400 flex-shrink-0 mt-1">
          {getInitials(message.user?.username)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 bg-[#1a1730] border border-white/10 rounded-full flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-1">
        {getInitials(message.user?.username)}
      </div>
      <div className="max-w-[75%]">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-gray-300">{message.user?.username}</span>
          <span className="text-xs text-gray-600">{formatTime(message.createdAt)}</span>
        </div>
        <div className="bg-[#1a1730] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
          <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    </div>
  )
}
