import axios from 'axios';

// ✅ Detecta se está no PC (localhost) ou no celular (IP da rede)
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
  ? 'http://localhost:3333' 
  : `http://${window.location.hostname}:3333`;

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
