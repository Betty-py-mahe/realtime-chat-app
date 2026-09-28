const { createMessage, updateStatus } = require('../models/message.model');

// In-memory map of currently connected users: socket.id -> username.
// This is fine for a single-instance deployment (Render/Railway free tier runs
// one instance); a multi-instance setup would move this into Redis, noted in the README.
const onlineUsers = new Map();

function broadcastOnlineUsers(io) {
  const usernames = [...new Set(onlineUsers.values())];
  io.emit('users:online', usernames);
}

function registerSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // --- Join / presence -------------------------------------------------
    socket.on('user:join', (username) => {
      if (!username || typeof username !== 'string') return;
      onlineUsers.set(socket.id, username.trim());
      broadcastOnlineUsers(io);
      socket.broadcast.emit('user:joined', { username: username.trim() });
    });

    // --- Messaging ---------------------------------------------------------
    socket.on('message:send', (payload, ack) => {
      try {
        const { username, text } = payload || {};

        if (!username || !text || !text.trim()) {
          if (typeof ack === 'function') {
            ack({ success: false, error: 'username and text are required.' });
          }
          return;
        }

        const message = createMessage({ username, text });

        // Broadcast to everyone (including the sender, so all clients render
        // from a single source of truth instead of doing local optimistic-only state).
        io.emit('message:new', message);

        // Mark delivered once it's been broadcast to the room.
        updateStatus(message.id, 'delivered');
        io.emit('message:status', { id: message.id, status: 'delivered' });

        if (typeof ack === 'function') ack({ success: true, data: message });
      } catch (err) {
        console.error('[socket message:send]', err);
        if (typeof ack === 'function') {
          ack({ success: false, error: 'Server error while sending message.' });
        }
      }
    });

    // --- Read receipts (bonus) ---------------------------------------------
    socket.on('message:read', (messageId) => {
      if (!messageId) return;
      updateStatus(messageId, 'read');
      io.emit('message:status', { id: messageId, status: 'read' });
    });

    // --- Typing indicator (bonus) -------------------------------------------
    socket.on('typing:start', (username) => {
      socket.broadcast.emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', (username) => {
      socket.broadcast.emit('typing:update', { username, isTyping: false });
    });

    // --- Disconnect handling (graceful) -------------------------------------
    socket.on('disconnect', (reason) => {
      const username = onlineUsers.get(socket.id);
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);
      if (username) {
        socket.broadcast.emit('user:left', { username });
      }
      console.log(`[socket] disconnected: ${socket.id} (${reason})`);
    });

    socket.on('error', (err) => {
      console.error(`[socket] error on ${socket.id}:`, err);
    });
  });
}

module.exports = registerSocketHandlers;
