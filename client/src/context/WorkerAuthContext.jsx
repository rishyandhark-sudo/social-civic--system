import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, attachAuthInterceptor } from '../../services/api';

const STORAGE_KEY = 'civic_worker_token';
attachAuthInterceptor(STORAGE_KEY);

const AuthContext = createContext(null);

export function WorkerAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('civic_worker_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function login(email, password) {
    const { data } = await api.post('/worker/auth/login', { email, password });
    setAuthToken(data.token, STORAGE_KEY);
    localStorage.setItem('civic_worker_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setAuthToken(null, STORAGE_KEY);
    localStorage.removeItem('civic_worker_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useWorkerAuth() {
  return useContext(AuthContext);
}
