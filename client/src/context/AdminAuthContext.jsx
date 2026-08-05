import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, attachAuthInterceptor } from '../../services/api';

const STORAGE_KEY = 'civic_admin_token';
attachAuthInterceptor(STORAGE_KEY);

const AuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('civic_admin_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/admin/auth/login', { email, password });
    setAuthToken(data.token, STORAGE_KEY);
    localStorage.setItem('civic_admin_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setAuthToken(null, STORAGE_KEY);
    localStorage.removeItem('civic_admin_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AuthContext);
}
