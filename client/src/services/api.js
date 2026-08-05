import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

// Attaches the JWT from localStorage to every outgoing request.
// Each portal stores its token under its own key so a citizen and an
// admin logged into the same browser (different tabs) don't clobber
// each other's session.
export function setAuthToken(token, storageKey) {
  if (token) {
    localStorage.setItem(storageKey, token);
  } else {
    localStorage.removeItem(storageKey);
  }
}

export function attachAuthInterceptor(storageKey) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem(storageKey);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

export default api;
