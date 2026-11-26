const jwt = require('jsonwebtoken');

const DEFAULT_ROOM = 'general';

/**
 * Configure Socket.IO authentication middleware and real-time chat events.
 */
function setupChatSocket(io) {
  // Handshake JWT authentication
  io.use((socket, next) => {
    const authToken = socket.handshake.auth && socket.handshake.auth.token;
    const headerAuth = socket.handshake.headers && socket.handshake.headers.authorization;
    const rawToken =
      authToken ||
      (headerAuth && headerAuth.startsWith('Bearer ') ? headerAuth.slice(7).trim() : null);

    if (!rawToken) {
      return next(new Error('Unauthorized: Missing JWT token.'));
    }

    try {
      const decoded = jwt.verify(rawToken, process.env.JWT_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      return next(new Error('Unauthorized: Invalid or expired JWT token.'));
    }
  });

  io.on('connection', (socket) => {
    const username = socket.user.username || socket.user.name || socket.user.email || 'Anonymous';

    console.log(`User connected: ${socket.id}`);
    socket.join(DEFAULT_ROOM);
    console.log(`${socket.id} joined room ${DEFAULT_ROOM}`);

    io.to(DEFAULT_ROOM).emit('chat:notification', {
      type: 'joined',
      user: username,
      message: `${username} joined the chat`,
      timestamp: new Date().toISOString(),
    });

    socket.on('chat:message', (payload) => {
      const text = typeof payload === 'string' ? payload : payload && payload.text;
      if (typeof text !== 'string' || !text.trim()) {
        return;
      }

      const cleanText = text.trim();
      const messageData = {
        sender: username,
        text: cleanText,
        timestamp: new Date().toISOString(),
      };

      console.log(`[${DEFAULT_ROOM}] ${username}: ${cleanText}`);
      io.to(DEFAULT_ROOM).emit('chat:message', messageData);
    });

    socket.on('disconnect', () => {
      io.to(DEFAULT_ROOM).emit('chat:notification', {
        type: 'left',
        user: username,
        message: `${username} left the chat`,
        timestamp: new Date().toISOString(),
      });
    });
  });
}

module.exports = setupChatSocket;
