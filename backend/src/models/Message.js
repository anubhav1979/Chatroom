const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  isAI:    { type: Boolean, default: false },
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  room:    { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);