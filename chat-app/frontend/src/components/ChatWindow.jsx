import { useEffect, useState } from 'react';
import useSocket from '../hooks/useSocket';
import { fetchHistory } from '../services/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import StatusBar from './StatusBar';

export default function ChatWindow({ username, onLogout }) {
  const {
    connected,
    connectionError,
    messages,
    onlineUsers,
    typingUser,
    sendMessage,
    startTyping,
    stopTyping,
    setInitialMessages,
  } = useSocket(username);

  const [historyError, setHistoryError] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load previous messages via REST on mount / refresh (requirement: "View
  // previous messages after refreshing the application").
  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    fetchHistory()
      .then((history) => {
        if (!cancelled) setInitialMessages(history);
      })
      .catch((err) => {
        console.error('[fetchHistory]', err);
        if (!cancelled) setHistoryError('Could not load chat history from the server.');
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });
    return () => {
      cancelled = true;
    };
  }, [setInitialMessages]);

  return (
    <div className="chat-window">
      <header className="chat-header">
        <h2>Realtime Chat</h2>
        <div className="header-right">
          <span className="current-user">{username}</span>
          <button className="logout-btn" onClick={onLogout}>
            Leave
          </button>
        </div>
      </header>

      <StatusBar
        connected={connected}
        onlineUsers={onlineUsers}
        typingUser={typingUser}
        currentUser={username}
      />

      {(connectionError || historyError) && (
        <div className="banner-error">{connectionError || historyError}</div>
      )}

      {loadingHistory ? (
        <div className="empty-state">Loading messages…</div>
      ) : (
        <MessageList messages={messages} currentUser={username} />
      )}

      <MessageInput
        onSend={sendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        disabled={!connected}
      />
    </div>
  );
}
