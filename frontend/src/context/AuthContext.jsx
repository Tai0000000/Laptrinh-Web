import { createContext, useContext, useState, useCallback } from 'react'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  
  const saveAuth = (data) => {
    const t = data.access_token ?? data.token
    localStorage.setItem('token', t)
    localStorage.setItem('user', JSON.stringify(data.user))
    setToken(t)
    setUser(data.user)
    return data.user
  }

  
  const login = useCallback(async (email, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()

    if (!res.ok) {
      const message =
        data?.errors?.email?.[0] ||
        data?.errors?.username?.[0] ||
        data?.message ||
        'Đăng nhập thất bại'
      throw new Error(message)
    }

    return saveAuth(data)
  }, [])

  
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${BASE_URL}/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        })
      }
    } catch {
      // bỏ qua lỗi network
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setToken(null)
      setUser(null)
    }
  }, [token])

  // ── register ───────────────────────────────────────────────────────────
  const register = useCallback(async (payload) => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Đăng ký thất bại')

    return saveAuth(data)
  }, [])

  const isAuthenticated = !!token && !!user
  const isRole = (role) => user?.role === role

  return (
    <AuthContext.Provider value={{ user, token, login, logout, register, isAuthenticated, isRole }}>
      {children}
    </AuthContext.Provider>
  )
}

// ── useAuth ────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>')
  return ctx
}

// ── useApi ─────────────────────────────────────────────────────────────────
export function useApi() {
  const { token } = useAuth()

  const headers = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })

  const request = async (method, path, body) => {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers: headers(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      })

      if (res.status === 204) return { success: true, data: null, message: 'OK' }

      const data = await res.json()

      if (!res.ok) {
        const message =
          Object.values(data?.errors || {})[0]?.[0] ||
          data?.message ||
          `HTTP ${res.status}`
        return { success: false, data: null, message }
      }

      return { success: true, data, message: 'OK' }
    } catch (err) {
      return { success: false, data: null, message: err.message || 'Network error' }
    }
  }

  return {
    get:    (path)       => request('GET',    path),
    post:   (path, body) => request('POST',   path, body),
    put:    (path, body) => request('PUT',    path, body),
    patch:  (path, body) => request('PATCH',  path, body),
    delete: (path)       => request('DELETE', path),
  }
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Khi app load, nếu có token thì verify với server
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      api.get('/auth/me')
        .then(res => {
          const u = res.data?.user ?? res.data;
          setUser(u);
          localStorage.setItem('user', JSON.stringify(u));
        })
        .catch(() => {
          // Token hết hạn hoặc không hợp lệ
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const saveAuth = (data) => {
    const t = data.token ?? data.access_token;
    const u = data.user;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(t);
    setUser(u);
    return u;
  };

  const login = useCallback(async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const u = saveAuth(res.data);
      return { success: true, user: u };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại.';
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (name, email, password, password_confirmation, role) => {
    try {
      const res = await api.post('/auth/register', {
        name, email, password, password_confirmation, role,
      });
      const u = saveAuth(res.data);
      return { success: true, user: u };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại.';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore — clear local state regardless
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!token && !!user;
  const isRole = (r) => (user?.role?.value ?? user?.role) === r;

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      login, register, logout,
      isAuthenticated, isRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng bên trong <AuthProvider>');
  return ctx;
};

