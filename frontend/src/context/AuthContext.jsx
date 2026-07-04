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
      // Lấy tất cả validation errors hoặc message chung
      const errors = err.response?.data?.errors;
      const message = errors
        ? Object.values(errors).flat().join(' ')
        : (err.response?.data?.message || 'Đăng ký thất bại.');
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
  // Hỗ trợ cả role là string ('admin') lẫn enum object ({value: 'admin'})
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

/**
 * useApi — hook tiện ích để gọi API với axios đã cấu hình sẵn token.
 * Trả về { get, post, put, patch, delete } chuẩn hóa response thành
 * { success, data, message }.
 */
export const useApi = () => {
  const request = async (method, path, body) => {
    try {
      const res = await api.request({
        method,
        url: path,
        ...(body !== undefined ? { data: body } : {}),
      });

      return { success: true, data: res.data, message: 'OK' };
    } catch (err) {
      if (err.response?.status === 204) {
        return { success: true, data: null, message: 'OK' };
      }
      const data = err.response?.data;
      const message =
        Object.values(data?.errors || {})[0]?.[0] ||
        data?.message ||
        err.message ||
        'Network error';
      return { success: false, data: null, message };
    }
  };

  return {
    get:    (path)        => request('GET',    path),
    post:   (path, body)  => request('POST',   path, body),
    put:    (path, body)  => request('PUT',    path, body),
    patch:  (path, body)  => request('PATCH',  path, body),
    delete: (path)        => request('DELETE', path),
  };
};
