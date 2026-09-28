require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const buildApp = require('./app');
const registerSocketHandlers = require('./sockets/socketHandler');

const PORT = process.env.PORT || 5000;
const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const app = buildApp();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io reachable from REST controllers (see message.controller.js) so a message
// posted over the REST API is *also* broadcast live to connected sockets.
app.set('io', io);

registerSocketHandlers(io);

server.listen(PORT, () => {
  console.log(`Chat backend listening on port ${PORT}`);
  console.log(`Allowed origins: ${allowedOrigins.join(', ') || '(none set, allowing all)'}`);
});

process.on('unhandledRejection', (err) => {
  console.error('[unhandledRejection]', err);
});
process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err);
});
