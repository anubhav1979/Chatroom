const express = require('express');
const router = express.Router();
const { getMessages } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

router.use(auth);
router.get('/:roomId', getMessages);

module.exports = router;