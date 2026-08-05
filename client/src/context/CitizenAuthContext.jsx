import { createContext, useContext, useState, useEffect } from 'react';
import api, { setAuthToken, attachAuthInterceptor } from '../../services/api';

const STORAGE_KEY = 'civic_citizen_token';
attachAuthInterceptor(STORAGE_KEY);

const AuthContext = createContext(null);

export function CitizenAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('civic_citizen_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  async function requestOtp(phone) {
    await api.post('/citizen/auth/otp/request', { phone });
  }

  async function verifyOtp(phone, otp, name) {
    const { data } = await api.post('/citizen/auth/otp/verify', { phone, otp, name });
    setAuthToken(data.token, STORAGE_KEY);
    localStorage.setItem('civic_citizen_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  function logout() {
    setAuthToken(null, STORAGE_KEY);
    localStorage.removeItem('civic_citizen_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useCitizenAuth() {
  return useContext(AuthContext);
}
