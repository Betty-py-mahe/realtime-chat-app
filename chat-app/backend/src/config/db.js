const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || './data/chat.db';
const resolvedPath = path.resolve(process.cwd(), DB_PATH);

// Make sure the folder holding the db file actually exists (Render/Railway give
// you an ephemeral filesystem, but the folder still needs to be created on boot).
const dir = path.dirname(resolvedPath);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const db = new Database(resolvedPath);
db.pragma('journal_mode = WAL');

// A single `messages` table is enough for this assignment's scope.
// status: 'sent' | 'delivered' | 'read' -> bonus feature (delivery/read receipts)
db.exec(`
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    username TEXT NOT NULL,
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'sent',
    created_at TEXT NOT NULL
  );
`);

module.exports = db;
