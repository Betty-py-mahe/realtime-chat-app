import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { API_URL } from '../services/api';

// Centralizes every Socket.io concern (connect, join, send, typing, presence,
// receipts, disconnect) so components stay declarative and just consume state.
export default function useSocket(username) {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!username) return undefined;

    const socket = io(API_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      setConnectionError(null);
      socket.emit('user:join', username);
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('connect_error', (err) => {
      console.error('[socket connect_error]', err.message);
      setConnectionError('Could not reach the chat server. Retrying...');
    });

    socket.on('message:new', (message) => {
      setMessages((prev) => {
        // Avoid duplicating a message the sender already rendered optimistically.
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('message:status', ({ id, status }) => {
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));
    });

    socket.on('users:online', (users) => setOnlineUsers(users));

    socket.on('typing:update', ({ username: who, isTyping }) => {
      setTypingUser(isTyping ? who : null);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [username]);

  const sendMessage = useCallback((text) => {
    const socket = socketRef.current;
    if (!socket || !text.trim()) return;
    socket.emit('message:send', { username, text }, (ack) => {
      if (!ack?.success) {
        console.error('[sendMessage] server rejected message:', ack?.error);
      }
    });
  }, [username]);

  const markRead = useCallback((messageId) => {
    socketRef.current?.emit('message:read', messageId);
  }, []);

  const startTyping = useCallback(() => {
    socketRef.current?.emit('typing:start', username);
  }, [username]);

  const stopTyping = useCallback(() => {
    socketRef.current?.emit('typing:stop', username);
  }, [username]);

  const setInitialMessages = useCallback((history) => {
    setMessages(history);
  }, []);

  return {
    connected,
    connectionError,
    messages,
    onlineUsers,
    typingUser,
    sendMessage,
    markRead,
    startTyping,
    stopTyping,
    setInitialMessages,
  };
}
