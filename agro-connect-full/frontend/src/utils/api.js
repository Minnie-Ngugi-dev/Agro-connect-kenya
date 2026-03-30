import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api', headers: { 'Content-Type': 'application/json' } });
api.interceptors.request.use(cfg => { const t = localStorage.getItem('agc_token'); if (t) cfg.headers.Authorization = `Bearer ${t}`; return cfg; });
api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) { localStorage.removeItem('agc_token'); localStorage.removeItem('agc_user'); window.location.href = '/login'; }
  return Promise.reject(err);
});
export default api;
