const express = require('express');
const cors = require('cors');
const messageRoutes = require('./routes/message.routes');
const authRoutes = require('./routes/auth.routes');

function buildApp() {
  const app = express();

  const allowedOrigins = (process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow tools like Postman/curl (no origin header) and any whitelisted origin.
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (req, res) => {
    res.status(200).json({ success: true, status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api', messageRoutes);
  app.use('/api/auth', authRoutes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Route not found.' });
  });

  // Centralized error handler (catches CORS errors and anything else thrown synchronously)
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    console.error('[unhandled error]', err.message);
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error.' });
  });

  return app;
}

module.exports = buildApp;
