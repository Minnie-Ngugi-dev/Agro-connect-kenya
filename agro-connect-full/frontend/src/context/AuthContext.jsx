import { createContext, useContext, useState } from 'react';
import api from '../utils/api.js';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('agc_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = async (phone, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { phone, password });
      localStorage.setItem('agc_token', data.token);
      localStorage.setItem('agc_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}! 🌾`);
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      throw err;
    } finally { setLoading(false); }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', formData);
      localStorage.setItem('agc_token', data.token);
      localStorage.setItem('agc_user', JSON.stringify(data.user));
      setUser(data.user);
      toast.success('Account created! 🎉');
      return data.user;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem('agc_token');
    localStorage.removeItem('agc_user');
    setUser(null);
    toast.success('Logged out');
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      localStorage.setItem('agc_user', JSON.stringify(data.user));
    } catch { logout(); }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
