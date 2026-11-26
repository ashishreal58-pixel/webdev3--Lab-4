require('dotenv').config();

const http = require('http');
const path = require('path');
const express = require('express');
const { Server } = require('socket.io');

const { connectDB } = require('./config/db');
const seedAdmin = require('./config/seedAdmin');
const registerEventListeners = require('./events/listeners');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const noteRoutes = require('./routes/noteRoutes');
const setupChatSocket = require('./sockets/chatSocket');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Parse JSON request bodies
app.use(express.json());

// Serve static chat demo page from public/
app.use(express.static(path.join(__dirname, 'public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api/notes', noteRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Register EventEmitter listeners and Socket.IO handlers
registerEventListeners();
setupChatSocket(io);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    await seedAdmin();

    server.listen(PORT, () => {
      console.log(`[server] listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
