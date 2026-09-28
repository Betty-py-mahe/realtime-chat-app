import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 8000,
});

export async function fetchHistory() {
  const { data } = await api.get('/messages');
  return data.data;
}

export async function sendMessageREST(username, text) {
  const { data } = await api.post('/messages', { username, text });
  return data.data;
}

export async function loginUser(username) {
  const { data } = await api.post('/auth/login', { username });
  return data.data;
}

export default api;
