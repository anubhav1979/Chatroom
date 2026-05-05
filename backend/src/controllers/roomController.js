const Room = require('../models/Room');
const Message = require('../models/Message');

const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ members: req.userId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.find().select('name isAI members');
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createRoom = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Room name required' });

    const exists = await Room.findOne({ name });
    if (exists) return res.status(409).json({ message: 'Room name taken' });

    const room = await Room.create({ name, members: [req.userId] });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const joinRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });

    if (room.members.includes(req.userId))
      return res.status(409).json({ message: 'Already a member' });

    room.members.push(req.userId);
    await room.save();
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getRoomMembers = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate('members', 'username status');
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.json(room.members);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRooms, getAllRooms, createRoom, joinRoom, getRoomMembers };