export default function StatusBar({ connected, onlineUsers, typingUser, currentUser }) {
  const othersOnline = onlineUsers.filter((u) => u !== currentUser);

  return (
    <div className="status-bar">
      <div className="connection-indicator">
        <span className={`dot ${connected ? 'dot-online' : 'dot-offline'}`} />
        {connected ? 'Connected' : 'Disconnected'}
      </div>
      <div className="online-users" title={othersOnline.join(', ')}>
        {othersOnline.length > 0
          ? `${othersOnline.length} online: ${othersOnline.slice(0, 3).join(', ')}${othersOnline.length > 3 ? '…' : ''}`
          : 'No one else online'}
      </div>
      <div className="typing-indicator">{typingUser ? `${typingUser} is typing…` : ''}</div>
    </div>
  );
}
