const express = require('express');
const { fetchMessages, postMessage } = require('../controllers/message.controller');

const router = express.Router();

router.get('/messages', fetchMessages);
router.post('/messages', postMessage);

module.exports = router;
