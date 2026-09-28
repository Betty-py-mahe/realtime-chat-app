import { useEffect, useRef } from 'react';

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function StatusTick({ status }) {
  if (status === 'read') return <span className="tick tick-read">✓✓</span>;
  if (status === 'delivered') return <span className="tick">✓✓</span>;
  return <span className="tick">✓</span>;
}

export default function MessageList({ messages, currentUser }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <div className="empty-state">No messages yet. Say hello 👋</div>;
  }

  return (
    <div className="message-list">
      {messages.map((msg) => {
        const isOwn = msg.username === currentUser;
        return (
          <div key={msg.id} className={`message-row ${isOwn ? 'own' : 'other'}`}>
            <div className="message-bubble">
              {!isOwn && <div className="message-author">{msg.username}</div>}
              <div className="message-text">{msg.text}</div>
              <div className="message-meta">
                <span>{formatTime(msg.createdAt)}</span>
                {isOwn && <StatusTick status={msg.status} />}
              </div>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}
