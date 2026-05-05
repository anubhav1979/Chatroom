const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const { getAIResponse } = require('../services/aiService');

const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log('User connected:', socket.userId);

    await User.findByIdAndUpdate(socket.userId, { status: 'online' });
    io.emit('user_status', { userId: socket.userId, status: 'online' });

    // Join all user's rooms
    const rooms = await Room.find({ members: socket.userId });
    rooms.forEach(r => socket.join(`room_${r._id}`));

    socket.on('join_room', ({ roomId }) => {
      socket.join(`room_${roomId}`);
    });

    socket.on('send_message', async ({ roomId, content }) => {
      try {
        if (!content?.trim()) return;

        const user = await User.findById(socket.userId).select('username');

        const message = await Message.create({
          content: content.trim(),
          user: socket.userId,
          room: roomId
        });

        io.to(`room_${roomId}`).emit('new_message', {
          _id: message._id,
          content: message.content,
          isAI: false,
          createdAt: message.createdAt,
          user: { _id: socket.userId, username: user.username },
          room: roomId
        });

        const room = await Room.findById(roomId);
        if (room?.isAI) {
          const history = await Message.find({ room: roomId })
            .sort({ createdAt: -1 })
            .limit(20);

          const aiText = await getAIResponse(content, history.reverse());

          const aiMessage = await Message.create({
            content: aiText,
            isAI: true,
            room: roomId
          });

          io.to(`room_${roomId}`).emit('new_message', {
            _id: aiMessage._id,
            content: aiMessage.content,
            isAI: true,
            createdAt: aiMessage.createdAt,
            user: { _id: 'bot', username: 'ChatBot 🤖' },
            room: roomId
          });
        }
      } catch (err) {
        console.error('send_message error:', err);
      }
    });

    socket.on('typing', ({ roomId, username }) => {
      socket.to(`room_${roomId}`).emit('user_typing', { username, roomId });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(`room_${roomId}`).emit('user_stop_typing', { roomId });
    });

    socket.on('disconnect', async () => {
      await User.findByIdAndUpdate(socket.userId, { status: 'offline' });
      io.emit('user_status', { userId: socket.userId, status: 'offline' });
    });
  });
};

module.exports = { initSocket };