# 🚀 Namaste Messenger

A modern, real-time chat application built with React, Node.js, and MongoDB. Features dual-protocol support (WebSocket + TCP), emoji picker, user presence tracking, and a beautiful responsive UI.

![Chat App Preview](https://via.placeholder.com/800x400/007bff/ffffff?text=Namaste+Messenger)

## ✨ Features

### 🎯 Core Features
- **Real-time Messaging** - Instant message delivery using WebSocket
- **Dual Protocol Support** - WebSocket primary, TCP fallback for reliability
- **User Authentication** - Secure JWT-based authentication
- **Online Presence** - Real-time user online/offline status
- **Emoji Support** - Built-in emoji picker with 15+ emojis
- **Typing Indicators** - See when users are typing
- **Message History** - Persistent message storage in MongoDB
- **Responsive Design** - Works perfectly on desktop and mobile

### 🔧 Technical Features
- **MongoDB Atlas Integration** - Cloud database support
- **Password Reset** - Email-based password recovery
- **Profile Management** - Update username and avatar
- **Message Acknowledgments** - Delivery confirmation system
- **Connection Fallback** - Automatic TCP fallback when WebSocket fails
- **Corporate Firewall Friendly** - TCP protocol works where WebSocket is blocked

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Socket.IO Client** - Real-time communication
- **Bootstrap 5** - Responsive UI framework
- **Bootstrap Icons** - Beautiful icon set
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Socket.IO** - WebSocket server
- **TCP Server** - Raw TCP socket support
- **MongoDB with Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Nodemailer** - Email functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bharadwajreddy07/Namaste_Messenger.git
   cd Namaste_Messenger
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set up environment variables**
   
   Create `server/.env` file:
   ```env
   HTTP_PORT=5000
   TCP_PORT=9000
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   NODE_ENV=development
   ```

5. **Start the application**

   **Terminal 1 - Start Backend:**
   ```bash
   cd server
   npm start
   ```

   **Terminal 2 - Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - TCP Server: localhost:9000

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/forgot-password` - Send reset email
- `POST /api/auth/reset-password` - Reset password with token

### User Endpoints
- `GET /api/users/me` - Get current user profile
- `GET /api/users` - Get all users
- `GET /api/users/online` - Get online users
- `PUT /api/users/profile` - Update profile

### Message Endpoints
- `POST /api/messages/send` - Send message via HTTP
- `GET /api/messages/history` - Get message history
- `POST /api/messages/ack` - Acknowledge message delivery

## 🔌 Connection Protocols

### WebSocket (Primary)
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: 'JWT_TOKEN_HERE' }
});

// Listen for messages
socket.on('newMessage', (message) => {
  console.log('New message:', message);
});

// Send message
socket.emit('newMessage', {
  content: 'Hello World!',
  type: 'general'
});
```

### TCP Socket (Fallback)
```bash
# Connect and authenticate
echo '{"type":"auth","token":"JWT_TOKEN_HERE"}' | nc localhost 9000

# Send message
echo '{"type":"message","to":"all","text":"Hello via TCP"}' | nc localhost 9000
```

## 🎨 UI Features

### Modern Design
- **Clean Interface** - Minimalist design with focus on usability
- **Custom Scrollbars** - Ultra-thin scrollbars (0.3px sidebar, 2px chat)
- **Wide Sidebar** - Spacious 900px sidebar for better user list visibility
- **Emoji Picker** - Quick access to 15 popular emojis
- **Responsive Layout** - Adapts to all screen sizes

### Color Scheme
- **Primary Blue** - #007bff for main actions
- **White Messages** - Clean white background for replies
- **Minimal Scrollbars** - Nearly invisible for distraction-free experience

## 🔒 Security Features

- **JWT Authentication** - Secure token-based auth
- **Password Hashing** - bcryptjs with salt rounds
- **Input Validation** - Server-side validation for all inputs
- **CORS Configuration** - Proper cross-origin resource sharing
- **Environment Variables** - Sensitive data in .env files

## 📱 Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers

## 🚀 Deployment

### MongoDB Atlas Setup
1. Create MongoDB Atlas account
2. Create cluster and database user
3. Whitelist IP addresses
4. Update MONGO_URI in .env

### Environment Variables for Production
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/chat-app
JWT_SECRET=production-secret-key-very-long-and-secure
HTTP_PORT=5000
TCP_PORT=9000
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Bharadwaj Reddy**
- GitHub: [@bharadwajreddy07](https://github.com/bharadwajreddy07)
- Email: nagabharadwajreddyjonnavaram@gmail.com

## 🙏 Acknowledgments

- Socket.IO team for excellent real-time communication library
- MongoDB team for the powerful database platform
- React team for the amazing frontend framework
- All contributors and users of this project

---

<div align="center">
  <strong>⭐ Star this repo if you like it! ⭐</strong>
</div>