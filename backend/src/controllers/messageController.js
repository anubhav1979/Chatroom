const Message = require('../models/Message');

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ room: req.params.roomId })
      .sort({ createdAt: 1 })
      .limit(100)
      .populate('user', 'username');
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMessages };