# Namaste Messenger - Deployment Guide

## Overview
This guide covers deployment of Namaste Messenger to:
- **Frontend**: Vercel (https://namaste-messenger.vercel.app)
- **Backend**: Render (https://namaste-messenger.onrender.com)
- **Database**: MongoDB Atlas

## Prerequisites
1. GitHub account with repository: https://github.com/bharadwajreddy07/namaste-messenger
2. Vercel account connected to GitHub
3. Render account connected to GitHub
4. MongoDB Atlas account with cluster

---

## Backend Deployment (Render)

### 1. Create New Web Service on Render
1. Go to https://render.com/dashboard
2. Click "New" → "Web Service"
3. Connect to GitHub repository: `bharadwajreddy07/namaste-messenger`
4. Configure the service:
   - **Name**: namaste-messenger
   - **Root Directory**: `server`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for better performance)

### 2. Set Environment Variables on Render
In Render dashboard → Environment:
```
MONGO_URI=mongodb+srv://chatapp:nani9908@chatapp.nlysxja.mongodb.net/chat-app
JWT_SECRET=your-secure-jwt-secret-here
NODE_ENV=production
HTTP_PORT=5000
TCP_PORT=9000
```

**Important**: Replace `your-secure-jwt-secret-here` with a strong random string.

### 3. Configure MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allow from anywhere)
   - Or find Render's IP addresses and whitelist them specifically

### 4. Deploy Backend
- Render will automatically deploy on push to `main` branch
- Monitor logs for successful startup
- Test health endpoint: https://namaste-messenger.onrender.com/api/health

---

## Frontend Deployment (Vercel)

### 1. Create New Project on Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import GitHub repository: `bharadwajreddy07/namaste-messenger`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Set Environment Variables on Vercel
In Vercel dashboard → Settings → Environment Variables:
```
VITE_API_URL=https://namaste-messenger.onrender.com
VITE_SOCKET_URL=https://namaste-messenger.onrender.com
```

### 3. Deploy Frontend
- Vercel will automatically deploy on push to `main` branch
- Production URL: https://namaste-messenger.vercel.app
- Preview URLs will be created for pull requests

---

## Local Development Setup

### 1. Clone Repository
```bash
git clone https://github.com/bharadwajreddy07/namaste-messenger.git
cd namaste-messenger
```

### 2. Backend Setup
```bash
cd server
npm install

# Create .env file
echo "MONGO_URI=mongodb+srv://chatapp:nani9908@chatapp.nlysxja.mongodb.net/chat-app" > .env
echo "JWT_SECRET=dev-secret-change-me" >> .env
echo "NODE_ENV=development" >> .env
echo "HTTP_PORT=5000" >> .env
echo "TCP_PORT=9000" >> .env

npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install

# .env.development is already configured for localhost
npm run dev
```

Frontend will run at: http://localhost:5173
Backend will run at: http://localhost:5000

---

## Environment Variables Reference

### Backend (server/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| MONGO_URI | MongoDB connection string | mongodb+srv://... |
| JWT_SECRET | Secret for JWT token signing | random-secure-string |
| NODE_ENV | Environment mode | development/production |
| HTTP_PORT | HTTP server port | 5000 |
| TCP_PORT | TCP server port | 9000 |

### Frontend (client/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL (without /api) | https://namaste-messenger.onrender.com |
| VITE_SOCKET_URL | WebSocket server URL | https://namaste-messenger.onrender.com |

**Note**: 
- `.env.development` is used for local development (localhost URLs)
- `.env.production` or `.env` is used for production builds (Render URLs)

---

## CORS Configuration

The backend is configured to accept requests from:
- http://localhost:5173 (local development)
- http://127.0.0.1:5173 (local development)
- https://namaste-messenger.vercel.app (production frontend)
- https://namaste-messenger-git-main-bharadwajreddy07.vercel.app (Vercel preview)
- https://namaste-messenger.onrender.com (backend itself)

If you get CORS errors, verify:
1. Frontend environment variables are set correctly
2. Backend is allowing the correct origins in `server/server.js`
3. Requests include credentials: `credentials: true`

---

## Troubleshooting

### Frontend Can't Connect to Backend
1. Check environment variables in Vercel dashboard
2. Ensure `VITE_API_URL` does NOT end with `/api` (it's added automatically)
3. Verify backend is running: https://namaste-messenger.onrender.com/api/health

### WebSocket Connection Failed
1. Check `VITE_SOCKET_URL` environment variable
2. Ensure Socket.IO CORS is configured correctly in `server/server.js`
3. Monitor Render logs for socket connection attempts

### Database Connection Error
1. Verify MongoDB Atlas IP whitelist includes `0.0.0.0/0` or Render IPs
2. Check MONGO_URI format and credentials
3. Ensure database user has read/write permissions

### 401 Unauthorized Errors
1. Check JWT_SECRET is set correctly in production
2. Verify token is being sent in Authorization header
3. Clear browser localStorage and login again

---

## Deployment Checklist

### Before Deploying
- [ ] Update MongoDB password (current password may be exposed)
- [ ] Generate secure JWT_SECRET for production
- [ ] Remove sensitive data from git history
- [ ] Test all features locally
- [ ] Verify .env files are in .gitignore

### Backend Deployment
- [ ] Create Render web service
- [ ] Set all environment variables
- [ ] Configure MongoDB Atlas IP whitelist
- [ ] Verify health endpoint works
- [ ] Test API endpoints with Postman

### Frontend Deployment
- [ ] Create Vercel project
- [ ] Set VITE_API_URL and VITE_SOCKET_URL
- [ ] Verify build completes successfully
- [ ] Test login, registration, messaging
- [ ] Test WebSocket connections (online users, typing indicator)

### Post-Deployment
- [ ] Monitor Render logs for errors
- [ ] Check Vercel analytics for traffic
- [ ] Test on multiple devices/browsers
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts

---

## Security Recommendations

1. **Change MongoDB Password**: Current password `nani9908` should be changed immediately
2. **Generate Secure JWT Secret**: Use a long random string (32+ characters)
3. **Environment Variables**: Never commit .env files to git
4. **HTTPS Only**: Ensure all production traffic uses HTTPS
5. **Rate Limiting**: Consider adding rate limiting middleware
6. **Input Validation**: All user inputs are validated on backend
7. **MongoDB Atlas**: Use database user with minimal required permissions

---

## Monitoring

### Backend (Render)
- View logs: Render Dashboard → namaste-messenger → Logs
- Monitor performance: Render Dashboard → Metrics
- Set up alerts: Render Dashboard → Notifications

### Frontend (Vercel)
- View deployments: Vercel Dashboard → namaste-messenger
- Analytics: Vercel Dashboard → Analytics
- Error tracking: Consider integrating Sentry

### Database (MongoDB Atlas)
- Monitor performance: Atlas Dashboard → Metrics
- View logs: Atlas Dashboard → Logs
- Set up alerts: Atlas Dashboard → Alerts

---

## Support

For issues or questions:
- Email: jonnavaramnagabharadwajreddy@gmail.com
- GitHub Issues: https://github.com/bharadwajreddy07/namaste-messenger/issues
