# Namaste Messenger Architecture Documentation

## Overview
Namaste Messenger is a modern real-time messaging application built with React.js frontend and Node.js backend, featuring both HTTP REST APIs and WebSocket connections for real-time communication.

## Technology Stack

### Frontend
- **React 19.1.1** - UI framework
- **Vite** - Build tool and development server
- **Bootstrap 5** - CSS framework for styling
- **Socket.IO Client** - WebSocket client for real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - WebSocket server implementation
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

## Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React App)                       │
├─────────────────────────────────────────────────────────────┤
│  Components:                                                │
│  ├── Home.jsx          (Landing page)                      │
│  ├── Login.jsx         (Authentication)                    │
│  ├── Register.jsx      (User registration)                 │
│  ├── Chat.jsx          (Main chat interface)              │
│  └── Header.jsx        (Navigation)                        │
│                                                             │
│  Contexts:                                                  │
│  ├── AuthContext.jsx   (User authentication state)        │
│  ├── SocketContext.jsx (WebSocket connection management)   │
│  └── ChatContext.jsx   (Chat state management)            │
└─────────────────────────────────────────────────────────────┘
                                │
                          HTTP & WebSocket
                                │
┌─────────────────────────────────────────────────────────────┐
│                    SERVER (Node.js)                         │
├─────────────────────────────────────────────────────────────┤
│  Main Server:                                               │
│  └── server.js         (Express app + Socket.IO server)    │
│                                                             │
│  API Routes:                                                │
│  ├── /api/auth/*       (Authentication endpoints)          │
│  └── /api/chat/*       (Chat-related endpoints)           │
│                                                             │
│  Models:                                                    │
│  ├── User.js           (User data schema)                 │
│  └── Message.js        (Message data schema)              │
│                                                             │
│  Controllers:                                               │
│  ├── authController.js (Auth business logic)              │
│  └── chatController.js (Chat business logic)              │
└─────────────────────────────────────────────────────────────┘
                                │
                            Database
                                │
┌─────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                         │
├─────────────────────────────────────────────────────────────┤
│  Collections:                                               │
│  ├── users             (User accounts and profiles)        │
│  └── messages          (Chat messages with metadata)       │
└─────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Structure

#### 1. App.jsx
- Root component that sets up routing
- Wraps application in context providers
- Defines route structure

#### 2. Contexts
**AuthContext.jsx**
- Manages user authentication state
- Handles login/logout functionality
- Provides user information throughout app
- Manages JWT token storage and validation

**SocketContext.jsx**
- Establishes WebSocket connection to server
- Manages connection state
- Handles real-time events (messages, typing, user status)
- Provides socket instance to components

**ChatContext.jsx**
- Manages chat state and message history
- Handles message sending/receiving
- Provides chat-related utilities

#### 3. Pages/Components
**Home.jsx**
- Landing page with app introduction
- Hero section with gradient styling
- Navigation to login/register

**Login.jsx & Register.jsx**
- User authentication forms
- Form validation and error handling
- JWT token management
- Redirect to chat on success

**Chat.jsx**
- Main chat interface with sidebar and message area
- Real-time message display
- User list with online status
- Message composition with reply functionality
- Demo user simulation for testing

**Header.jsx**
- Navigation bar with app branding
- User menu and logout functionality
- Responsive design

### State Management Flow

```
User Action → Component State → Context State → Backend API/WebSocket → Database → Real-time Updates
```

## Backend Architecture

### Server Structure

#### 1. server.js
Main server file that:
- Initializes Express application
- Sets up MongoDB connection
- Configures CORS and middleware
- Establishes Socket.IO server
- Defines API routes
- Handles WebSocket connections

#### 2. Database Models

**User Model (models/User.js)**
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique, required),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
```

**Message Model (models/Message.js)**
```javascript
{
  _id: ObjectId,
  senderId: ObjectId (ref: User),
  recipientId: ObjectId (ref: User) | null,
  content: String,
  type: String ('direct' | 'general'),
  replyTo: {
    id: ObjectId,
    content: String,
    senderUsername: String
  } | null,
  createdAt: Date,
  updatedAt: Date
}
```

#### 3. API Endpoints

**Authentication APIs (apis/auth.js)**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Token verification

**Chat APIs (apis/chat.js)**
- `GET /api/chat/messages` - Retrieve chat messages
- `POST /api/chat/send` - Send message (fallback to HTTP)
- `GET /api/chat/users` - Get online users

### WebSocket Implementation

#### Connection Management
```javascript
// Socket connection with JWT authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  // Verify JW T and attach user to socket
});

// User connection tracking
const onlineUsers = new Map(); // userId -> socket
```

#### Real-time Events

**Client to Server Events:**
- `join` - User joins chat room
- `sendMessage` - Send chat message
- `typing` - User typing indicator
- `disconnect` - User leaves

**Server to Client Events:**
- `message` - New message broadcast
- `userJoined` - User connected notification
- `userLeft` - User disconnected notification
- `userTyping` - Typing indicator
- `onlineUsers` - Updated user list

### Message Flow

#### 1. HTTP Message Sending
```
Client → POST /api/chat/send → Validate → Save to DB → Broadcast via WebSocket → All Connected Clients
```

#### 2. WebSocket Message Sending
```
Client → 'sendMessage' event → Validate → Save to DB → Broadcast to recipients → Update UI
```

#### 3. Real-time Updates
```
New Message → Save to MongoDB → WebSocket Broadcast → Client Receives → UI Updates
```

## Authentication System

### JWT Implementation
1. User registers/logs in with credentials
2. Server validates and creates JWT token
3. Token stored in localStorage on client
4. Token included in API requests and WebSocket auth
5. Server middleware validates token for protected routes

### Security Features
- Password hashing with bcrypt
- JWT token expiration
- Protected API routes
- WebSocket authentication
- CORS configuration

## Database Design

### MongoDB Collections

#### Users Collection
Stores user account information with unique constraints on username and email.

#### Messages Collection
Stores all chat messages with references to users and optional reply metadata.

### Indexing Strategy
- User username and email for quick lookups
- Message timestamps for chronological ordering
- Sender/recipient IDs for filtering user conversations

## Real-time Communication

### WebSocket Events Flow

1. **Connection Establishment**
   ```
   Client connects → JWT validation → Store socket reference → Emit user online status
   ```

2. **Message Broadcasting**
   ```
   User sends message → Validate → Save to DB → Broadcast to relevant users → UI updates
   ```

3. **User Status Management**
   ```
   User connects/disconnects → Update online users list → Broadcast status changes
   ```

### Typing Indicators
Real-time typing indicators using WebSocket events with debounced emission to reduce server load.

## File Structure

```
NamasteMessenger/
├── client/                 # Frontend React application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Main page components
│   │   ├── contexts/      # React contexts for state management
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                # Backend Node.js application
│   ├── apis/              # Route handlers
│   ├── models/            # Database models
│   ├── controllers/       # Business logic
│   ├── server.js          # Main server file
│   └── package.json
└── README.md
```

## Development Workflow

### Frontend Development
1. Components built with React hooks
2. State management through contexts
3. Real-time updates via WebSocket connection
4. Responsive design with Bootstrap
5. Build and bundling with Vite

### Backend Development
1. Express.js server with modular route structure
2. MongoDB integration with Mongoose
3. WebSocket server with Socket.IO
4. JWT-based authentication
5. RESTful API design

## Deployment Considerations

### Environment Variables
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `HTTP_PORT` - HTTP server port
- `TCP_PORT` - TCP server port (if used)

### Production Optimizations
- Database indexing for performance
- WebSocket connection pooling
- JWT token refresh mechanism
- Error logging and monitoring
- HTTPS configuration
- Database connection pooling

## Security Measures

1. **Authentication**
   - JWT token-based authentication
   - Password hashing with bcrypt
   - Protected routes and WebSocket connections

2. **Data Validation**
   - Input sanitization
   - Schema validation with Mongoose
   - XSS prevention

3. **Network Security**
   - CORS configuration
   - Rate limiting (recommended)
   - HTTPS in production (recommended)

## Performance Features

1. **Frontend**
   - Lazy loading of components
   - Optimized re-renders with React hooks
   - Efficient state management

2. **Backend**
   - Database query optimization
   - Connection pooling
   - WebSocket connection management

3. **Real-time**
   - Debounced typing indicators
   - Efficient message broadcasting
   - Connection state management

This architecture provides a scalable, secure, and performant real-time chat application with modern web technologies.