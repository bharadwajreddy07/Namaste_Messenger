require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const net = require('net');
const http = require('http');
const jwt = require('jsonwebtoken');
const { Server: IOServer } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');

const User = require('./models/User');
const Message = require('./models/Message');

const authApis = require('./apis/auth');
const messageApis = require('./apis/chat');

const HTTP_PORT = process.env.HTTP_PORT || 5000;
const TCP_PORT = process.env.TCP_PORT || 9000;

const sockets = new Map();

function sendToRecipientSocket(recipientEntry, payload) {
	const entry = sockets.get(recipientEntry.username);
	if (!entry) return false;
	if (entry.ws && entry.ws.connected) {
		try {
			entry.ws.emit('message', payload);
			return true;
		} catch (e) {
		}
	}
	if (entry.tcp) {
		try {
			entry.tcp.write(JSON.stringify(payload) + '\n');
			return true;
		} catch (e) {
			return false;
		}
	}
	return false;
}
async function connectToDatabase() {
	const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/chat-app';
	try {
		const connection = await mongoose.connect(MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('Successfully connected to MongoDB:', MONGO_URI);
		console.log('Database name:', connection.connection.db.databaseName);
		console.log('Connection state:', mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected');
		
		// Listen for connection events
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});
		
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected');
		});
		
		return connection;
	} catch (err) {
		console.error('Failed to connect to MongoDB:', err.message);
		throw err;
	}
}

async function start() {
	await connectToDatabase();

	const app = express();
	
	// CORS configuration
	app.use(cors({
		origin: ['http://localhost:5173', 'http://127.0.0.1:5173'], // Vite dev server
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	}));
	
	app.use(bodyParser.json());

	// Health check endpoints
	app.get('/', (req, res) => {
		res.json({ 
			message: 'Chat App Backend is running!', 
			status: 'healthy',
			timestamp: new Date().toISOString()
		});
	});

	// Health check endpoint
	app.get('/api/health', (req, res) => {
		res.json({
			status: 'OK',
			success: true,
			message: 'Chat App Backend is healthy',
			timestamp: new Date().toISOString(),
			version: '1.0.0'
		});
	});

	app.use('/api/auth', authApis);
	app.use('/api/chat', messageApis);
	app.use('/api/messages', messageApis);  // Alternative route for messages
	
	// User endpoints
	const userApis = require('./apis/users');
	app.use('/api/users', userApis);

	const httpServer = http.createServer(app);
	const io = new IOServer(httpServer, { 
		cors: { 
			origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:5174', 'http://localhost:5175'],
			credentials: true
		}
	});

	// socket.io connection handling
	io.on('connection', async (socket) => {
		// token may be passed in handshake auth
		const token = socket.handshake.auth && socket.handshake.auth.token;
		if (!token) {
			socket.emit('error', { message: 'missing token' });
			socket.disconnect(true);
			return;
		}
		const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
		let username, user;
		try {
			const payload = jwt.verify(token, JWT_SECRET);
			username = payload.username;
			user = await User.findOne({ username });
			if (!user) {
				socket.emit('error', { message: 'user not found' });
				socket.disconnect(true);
				return;
			}
		} catch (err) {
			socket.emit('error', { message: 'invalid token' });
			socket.disconnect(true);
			return;
		}

		// store ws socket with user info
		const existing = sockets.get(username) || {};
		existing.userId = user._id.toString();
		existing.ws = socket;
		sockets.set(username, existing);
		await User.updateOne({ username }, { $set: { online: true, connectedAt: new Date(), lastSeen: new Date() } });

		// Send current online users to the new connection
		const onlineUsers = [];
		for (const [u, entry] of sockets.entries()) {
			if (entry.ws && entry.ws.connected) {
				const userData = await User.findOne({ username: u }, 'username _id').lean();
				if (userData) {
					onlineUsers.push({
						id: userData._id.toString(),
						username: userData.username
					});
				}
			}
		}
		socket.emit('onlineUsers', onlineUsers);

		// notify other connected sockets about new user
		const newUserData = {
			id: user._id.toString(),
			username: user.username
		};
		
		// Broadcast userJoined event to all other connected users
		socket.broadcast.emit('userJoined', newUserData);
		
		for (const [u, entry] of sockets.entries()) {
			if (u === username) continue;
			if (entry.ws && entry.ws.connected) {
				entry.ws.emit('presence', { username, status: 'online', ts: Date.now() });
				entry.ws.emit('userOnline', newUserData);
			}
			if (entry.tcp) entry.tcp.write(JSON.stringify({ type: 'presence', username, status: 'online', ts: Date.now() }) + '\n');
		}

		socket.on('message', async (msg) => {
			// msg: { to, text }
			const to = msg.to || 'all';
			const text = msg.text || '';
			const msgId = uuidv4();
			let recipients = [];
			if (to === 'all') {
				const users = await User.find({}, 'username').lean();
				recipients = users.filter(u => u.username !== username).map(u => ({ username: u.username }));
			} else {
				recipients = [{ username: to }];
			}
			const message = new Message({ msgId, from: username, to, text, recipients });
			await message.save();

			const payload = { type: 'message', msgId: message.msgId, from: message.from, to: message.to, text: message.text, ts: message.ts };
			for (const r of message.recipients) {
				sendToRecipientSocket(r, payload);
			}

			socket.emit('accepted', { msgId: message.msgId });
		});

		// Handle typing events
		socket.on('typing', (data) => {
			const { isTyping, chatType, chatId } = data;
			
			// Broadcast typing status to relevant users
			if (chatType === 'general') {
				// Broadcast to all connected users except sender
				socket.broadcast.emit('userTyping', {
					userId: user.id,
					username: user.username,
					isTyping,
					chatType,
					chatId
				});
			} else if (chatType === 'direct' && chatId) {
				// Send to specific user in direct message
				for (const [u, entry] of sockets.entries()) {
					if (entry.ws && entry.ws.connected && entry.userId === chatId) {
						entry.ws.emit('userTyping', {
							userId: user.id,
							username: user.username,
							isTyping,
							chatType,
							chatId
						});
						break;
					}
				}
			}
		});

		// Handle new message format
		socket.on('newMessage', async (messageData) => {
			try {
				const { content, type, recipientId } = messageData;
				const msgId = uuidv4();
				
				let targetRecipient = 'all';
				let recipients = [];
				
				if (type === 'direct' && recipientId) {
					const recipientUser = await User.findById(recipientId);
					if (recipientUser) {
						targetRecipient = recipientUser.username;
						recipients = [{ username: recipientUser.username }];
					}
				} else {
					const users = await User.find({}, 'username').lean();
					recipients = users.filter(u => u.username !== username).map(u => ({ username: u.username }));
				}

				const message = new Message({
					msgId,
					from: username,
					to: targetRecipient,
					content,
					type,
					senderId: user.id,
					recipientId,
					recipients
				});
				
				await message.save();

				const payload = {
					id: message._id,
					msgId: message.msgId,
					content: message.content,
					senderId: message.senderId,
					senderUsername: message.from,
					recipientId: message.recipientId,
					type: message.type,
					createdAt: message.timestamp,
					timestamp: message.timestamp
				};

				// Emit to specific recipient or broadcast to all
				if (type === 'direct' && recipientId) {
					// Send to specific user
					for (const [u, entry] of sockets.entries()) {
						if (entry.ws && entry.ws.connected && entry.userId === recipientId) {
							entry.ws.emit('newMessage', payload);
							break;
						}
					}
					// Also send to sender so they see their own message
					socket.emit('newMessage', payload);
				} else {
					// Broadcast to all users INCLUDING sender
					io.emit('newMessage', payload);
				}

				// Confirm message delivery to sender
				socket.emit('messageDelivered', { success: true, messageId: payload.id });
			} catch (error) {
				console.error('New message error:', error);
				socket.emit('messageError', { error: 'Failed to send message' });
			}
		});

		socket.on('ack', async (data) => {
			const { msgId } = data || {};
			if (!msgId) return;
			const message = await Message.findOne({ msgId });
			if (message) {
				const rec = message.recipients.find(r => r.username === username);
				if (rec) {
					rec.delivered = true;
					rec.deliveredAt = new Date();
					await message.save();
				}
			}
		});

		socket.on('disconnect', async () => {
			// remove ws socket only
			const entry = sockets.get(username);
			if (entry) {
				delete entry.ws;
				if (!entry.tcp) sockets.delete(username);
				else sockets.set(username, entry);
			}
			// if no sockets left mark offline
			const still = sockets.get(username);
			if (!still) {
				await User.updateOne({ username }, { $set: { online: false, lastSeen: new Date() } });
				
				// Broadcast userLeft event to all connected users
				const userData = {
					id: user._id.toString(),
					username: username
				};
				socket.broadcast.emit('userLeft', userData);
				
				for (const [u, e] of sockets.entries()) {
					if (e.ws && e.ws.connected) e.ws.emit('presence', { username, status: 'offline', ts: Date.now() });
					if (e.tcp) e.tcp.write(JSON.stringify({ type: 'presence', username, status: 'offline', ts: Date.now() }) + '\n');
				}
			}
		});
	});

	httpServer.on('error', (err) => {
		if (err.code === 'EADDRINUSE') {
			console.error(` HTTP port ${HTTP_PORT} is already in use. Please use a different port.`);
			process.exit(1);
		} else {
			console.error('HTTP server error:', err.message);
		}
	});

	httpServer.listen(HTTP_PORT, () => {
		console.log(` Chat App Backend running on http://localhost:${HTTP_PORT}`);
		console.log(` WebSocket server ready for real-time chat`);
	});

	// TCP server: clients authenticate with JWT via the auth HTTP endpoint token
	const tcpServer = net.createServer((socket) => {
		socket.setEncoding('utf8');
		let username = null;

		console.log('TCP client connected', socket.remoteAddress, socket.remotePort);

		socket.on('data', async (chunk) => {
			const parts = chunk.split(/\r?\n/).filter(Boolean);
			for (const p of parts) {
				let msg;
				try {
					msg = JSON.parse(p);
				} catch (e) {
					socket.write(JSON.stringify({ type: 'error', message: 'invalid json' }) + '\n');
					continue;
				}

				// first: auth
				if (msg.type === 'auth') {
					const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
					try {
						const payload = jwt.verify(msg.token, JWT_SECRET);
						username = payload.username;
						const existing = sockets.get(username) || {};
						existing.tcp = socket;
						sockets.set(username, existing);
						await User.updateOne({ username }, { $set: { online: true, connectedAt: new Date(), lastSeen: new Date() } });
						socket.write(JSON.stringify({ type: 'ok', message: 'authenticated', username }) + '\n');

						// announce presence to others
						for (const [u, entry] of sockets.entries()) {
							if (u === username) continue;
							if (entry.ws && entry.ws.connected) entry.ws.emit('presence', { username, status: 'online', ts: Date.now() });
							if (entry.tcp) entry.tcp.write(JSON.stringify({ type: 'presence', username, status: 'online', ts: Date.now() }) + '\n');
						}
					} catch (err) {
						socket.write(JSON.stringify({ type: 'error', message: 'invalid token' }) + '\n');
						socket.destroy();
					}
					continue;
				}

				if (!username) {
					socket.write(JSON.stringify({ type: 'error', message: 'not authenticated' }) + '\n');
					continue;
				}

				// message handling
				if (msg.type === 'message') {
					const to = msg.to || 'all';
					const text = msg.text || '';
					const msgId = uuidv4();
					let recipients = [];
					if (to === 'all') {
						const users = await User.find({}, 'username').lean();
						recipients = users.filter(u => u.username !== username).map(u => ({ username: u.username }));
					} else {
						recipients = [{ username: to }];
					}
					const message = new Message({ msgId, from: username, to, text, recipients });
					await message.save();

					// send to online recipients immediately
					const payload = { type: 'message', msgId: message.msgId, from: message.from, to: message.to, text: message.text, ts: message.ts };
					for (const r of message.recipients) {
						sendToRecipientSocket(r, payload);
					}

					// ack to sender that message stored
					socket.write(JSON.stringify({ type: 'accepted', msgId: message.msgId }) + '\n');
					continue;
				}

				if (msg.type === 'ack') {
					// mark delivered in DB
					const { msgId } = msg;
					if (!msgId) continue;
					const message = await Message.findOne({ msgId });
					if (message) {
						const rec = message.recipients.find(r => r.username === username);
						if (rec) {
							rec.delivered = true;
							rec.deliveredAt = new Date();
							await message.save();
						}
					}
					continue;
				}

				socket.write(JSON.stringify({ type: 'error', message: 'unknown message type' }) + '\n');
			}
		});

		socket.on('close', async () => {
			console.log('TCP client disconnected', username);
			if (username) {
				const entry = sockets.get(username);
				if (entry) {
					delete entry.tcp;
					if (!entry.ws) sockets.delete(username);
					else sockets.set(username, entry);
				}
				const still = sockets.get(username);
				if (!still) {
					await User.updateOne({ username }, { $set: { online: false, lastSeen: new Date() } });
					for (const [u, e] of sockets.entries()) {
						if (e.ws && e.ws.connected) e.ws.emit('presence', { username, status: 'offline', ts: Date.now() });
						if (e.tcp) e.tcp.write(JSON.stringify({ type: 'presence', username, status: 'offline', ts: Date.now() }) + '\n');
					}
				}
			}
		});

		socket.on('error', (err) => {
			console.log('TCP socket error', err && err.message);
		});
	});

	tcpServer.on('error', (err) => {
		if (err.code === 'EADDRINUSE') {
			console.error(` TCP port ${TCP_PORT} is already in use. Please kill existing processes or use a different port.`);
			console.log(` To kill existing node processes, run: taskkill /f /im node.exe`);
			process.exit(1);
		} else {
			console.error('TCP server error:', err.message);
		}
	});

	tcpServer.listen(TCP_PORT, () => {
		console.log(` TCP server listening on port ${TCP_PORT}`);
	});
}

start().catch(err => {
	console.error('Failed to start server', err && err.message);
	process.exit(1);
});


