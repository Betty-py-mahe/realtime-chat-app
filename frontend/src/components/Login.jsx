import { useState } from 'react';
import { loginUser } from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim()) {
      setError('Please enter a username.');
      return;
    }
    setLoading(true);
    try {
      const data = await loginUser(username);
      onLogin(data.username);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not log in. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Realtime Chat</h1>
        <p className="subtitle">Pick a username to join the conversation</p>
        <input
          autoFocus
          type="text"
          placeholder="e.g. sam_dev"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
        />
        {error && <p className="error-text">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join Chat'}
        </button>
      </form>
    </div>
  );
}
