const { createMessage, getHistory } = require('../models/message.model');

// GET /api/messages - fetch chat history (used on app load / refresh)
function fetchMessages(req, res) {
  try {
    const messages = getHistory();
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    console.error('[fetchMessages]', err);
    res.status(500).json({ success: false, error: 'Could not fetch chat history.' });
  }
}

// POST /api/messages - persist a message over REST.
// This exists to satisfy the "Send messages" REST requirement and as a fallback
// if a client's socket connection drops; the socket layer is still what gives
// every *other* connected client the instant, real-time update.
function postMessage(req, res) {
  try {
    const { username, text } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, error: 'username is required.' });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'text is required.' });
    }
    if (text.length > 2000) {
      return res.status(400).json({ success: false, error: 'Message is too long.' });
    }

    const message = createMessage({ username, text });

    // Broadcast to every connected client, including ones that joined via socket only.
    const io = req.app.get('io');
    if (io) io.emit('message:new', message);

    res.status(201).json({ success: true, data: message });
  } catch (err) {
    console.error('[postMessage]', err);
    res.status(500).json({ success: false, error: 'Could not send message.' });
  }
}

module.exports = { fetchMessages, postMessage };
