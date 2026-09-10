import axios from 'axios';

// Em desenvolvimento usa localhost, em produção usa Render
const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3333'
  : 'https://condpro.onrender.com';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@condomanager:token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function uploadFile(expenseId: string, file: File) {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/expenses/${expenseId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export default api;
