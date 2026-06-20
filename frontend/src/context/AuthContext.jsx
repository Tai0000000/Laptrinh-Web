
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (error) {
      console.error('Check auth failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password, password_confirmation, role) => {
    try {
      const response = await api.post('/register', { 
        name, 
        email, 
        password, 
        password_confirmation, 
        role 
      });
      const { access_token, user } = response.data;
      localStorage.setItem('token', access_token);
      setUser(user);
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

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

