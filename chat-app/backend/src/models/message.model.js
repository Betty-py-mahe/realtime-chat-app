const { v4: uuidv4 } = require('uuid');
const db = require('../config/db');

const insertStmt = db.prepare(`
  INSERT INTO messages (id, username, text, status, created_at)
  VALUES (@id, @username, @text, @status, @created_at)
`);

const selectAllStmt = db.prepare(`
  SELECT id, username, text, status, created_at AS createdAt
  FROM messages
  ORDER BY created_at ASC
  LIMIT ?
`);

const updateStatusStmt = db.prepare(`
  UPDATE messages SET status = ? WHERE id = ?
`);

function createMessage({ username, text }) {
  const message = {
    id: uuidv4(),
    username: username.trim(),
    text: text.trim(),
    status: 'sent',
    created_at: new Date().toISOString(),
  };
  insertStmt.run(message);
  return { ...message, createdAt: message.created_at };
}

// Simple pagination-free history fetch (fine for an assignment-scale app).
// A production version would paginate with `before`/`limit` cursors.
function getHistory(limit = 200) {
  return selectAllStmt.all(limit);
}

function updateStatus(id, status) {
  updateStatusStmt.run(status, id);
}

module.exports = { createMessage, getHistory, updateStatus };
