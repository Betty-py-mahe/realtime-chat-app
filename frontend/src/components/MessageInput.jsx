import { useRef, useState } from 'react';

export default function MessageInput({ onSend, onTypingStart, onTypingStop, disabled }) {
  const [text, setText] = useState('');
  const typingTimeoutRef = useRef(null);

  function handleChange(e) {
    setText(e.target.value);
    onTypingStart();
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => onTypingStop(), 1200);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    clearTimeout(typingTimeoutRef.current);
    onTypingStop();
  }

  return (
    <form className="message-input-row" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={disabled ? 'Connecting...' : 'Type a message'}
        value={text}
        onChange={handleChange}
        disabled={disabled}
        maxLength={2000}
      />
      <button type="submit" disabled={disabled || !text.trim()}>
        Send
      </button>
    </form>
  );
}
