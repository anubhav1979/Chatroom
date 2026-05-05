const express = require('express');
const router = express.Router();
const { getRooms, getAllRooms, createRoom, joinRoom, getRoomMembers } = require('../controllers/roomController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/', getRooms);
router.get('/all', getAllRooms);
router.post('/', createRoom);
router.post('/:id/join', joinRoom);
router.get('/:id/members', getRoomMembers);

module.exports = router;