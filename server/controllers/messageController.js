const { v4: uuidv4 } = require('uuid');
const Message = require('../models/Message');
const User = require('../models/User');

// Send message from authenticated user
async function sendMessage(req, res) {
  try {
    const from = req.user.username;
    const senderId = req.user.id;
    const { to = 'all', content, recipientId, type = 'general' } = req.body;
    
    if (!content) return res.status(400).json({ error: 'Message content is required' });

    const msgId = uuidv4();
    let recipients = [];
    let targetRecipient = to;

    // Handle new message format
    if (type === 'direct' && recipientId) {
      // Direct message - find recipient by ID
      const recipientUser = await User.findById(recipientId);
      if (!recipientUser) {
        return res.status(404).json({ error: 'Recipient not found' });
      }
      targetRecipient = recipientUser.username;
      recipients = [{ username: recipientUser.username }];
    } else if (type === 'general' || targetRecipient === 'all') {
      // General/public message
      const users = await User.find({}, 'username').lean();
      recipients = users.filter(u => u.username !== from).map(u => ({ username: u.username }));
      targetRecipient = 'all';
    } else {
      // Direct message with username
      recipients = [{ username: targetRecipient }];
    }

    const message = new Message({ 
      msgId, 
      from, 
      to: targetRecipient, 
      content, 
      recipients,
      type: type,
      senderId: senderId,
      recipientId: recipientId
    });
    await message.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Message sent successfully',
      msgId,
      data: {
        id: message._id,
        msgId: message.msgId,
        from: message.from,
        to: message.to,
        content: message.content,
        timestamp: message.timestamp,
        type: message.type,
        senderId: message.senderId,
        recipientId: message.recipientId,
        senderUsername: from
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function listMessages(req, res) {
  try {
    const username = req.user.username;
    const userId = req.user.id;
    
    // Return messages addressed to 'all' (general) or direct messages involving the user
    const msgs = await Message.find({ 
      $or: [ 
        { to: 'all', type: 'general' }, 
        { to: username }, 
        { from: username },
        { senderId: userId },
        { recipientId: userId }
      ] 
    }).sort({ timestamp: 1 }).lean();
    
    res.json({ 
      success: true,
      messages: msgs.map(msg => ({
        id: msg._id,
        msgId: msg.msgId,
        content: msg.content,
        senderId: msg.senderId,
        senderUsername: msg.from,
        recipientId: msg.recipientId,
        type: msg.type || 'general',
        createdAt: msg.timestamp,
        timestamp: msg.timestamp,
        recipients: msg.recipients
      }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Acknowledge message delivery
async function ackMessage(req, res) {
  try {
    const username = req.user.username;
    const { msgId } = req.body;
    if (!msgId) return res.status(400).json({ error: 'Message ID is required' });
    
    const msg = await Message.findOne({ msgId });
    if (!msg) return res.status(404).json({ error: 'Message not found' });
    
    const rec = msg.recipients.find(r => r.username === username);
    if (rec) {
      rec.delivered = true;
      rec.deliveredAt = new Date();
      await msg.save();
    }
    
    res.json({ 
      success: true,
      message: 'Message acknowledged successfully'
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { sendMessage, listMessages, ackMessage };
