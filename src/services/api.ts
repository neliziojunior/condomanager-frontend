import axios from 'axios';

// ✅ Forçar IP do backend
const API_URL = 'http://192.168.0.3:3333';

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
