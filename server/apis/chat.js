const express = require('express');
const router = express.Router();
const { sendMessage, listMessages, ackMessage } = require('../controllers/messageController');
const jwtMiddleware = require('../middleware/auth');

// Send a message
router.post('/messages', jwtMiddleware, sendMessage);
router.post('/send', jwtMiddleware, sendMessage);

// Get message history  
router.get('/messages', jwtMiddleware, listMessages);
router.get('/history', jwtMiddleware, listMessages);

// Acknowledge message delivery
router.post('/ack', jwtMiddleware, ackMessage);

module.exports = router;