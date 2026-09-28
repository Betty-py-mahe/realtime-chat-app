const express = require('express');
const router = express.Router();

// POST /api/auth/login - dummy, username-only "authentication" (bonus requirement).
// No password, no persistence: it just validates the username shape and hands it back.
// A real app would issue a signed JWT here; that's called out as an assumption in the README.
router.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username || !username.trim()) {
    return res.status(400).json({ success: false, error: 'username is required.' });
  }
  if (!/^[a-zA-Z0-9_ ]{2,20}$/.test(username.trim())) {
    return res.status(400).json({
      success: false,
      error: 'username must be 2-20 characters (letters, numbers, spaces, underscores).',
    });
  }

  res.status(200).json({ success: true, data: { username: username.trim() } });
});

module.exports = router;
