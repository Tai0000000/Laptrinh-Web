<<<<<<< HEAD
import React, { createContext, useContext, useState, useEffect } from 'react';
=======
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
>>>>>>> 52c0e70301f4f8ca44b8b30a5c660b9ec94ac2ff
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
<<<<<<< HEAD
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    localStorage.setItem('token', token);
                    const res = await api.get('/auth/me');
                    setUser(res.data.user);
                } catch (err) {
                    console.error('Failed to load user info', err);
                    logout();
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        };
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        setError('');
        try {
            const res = await api.post('/auth/login', { email, password });
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const message = err.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(message);
            throw new Error(message);
        }
    };

    const register = async (name, email, password, password_confirmation, role) => {
        setError('');
        try {
            const res = await api.post('/auth/register', {
                name,
                email,
                password,
                password_confirmation,
                role
            });
            setToken(res.data.token);
            setUser(res.data.user);
            return res.data.user;
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed. Please check details.';
            setError(message);
            throw new Error(message);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError('');
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, error, login, register, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
=======
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

  const saveAuth = (data) => {
    const t = data.access_token ?? data.token;
    localStorage.setItem('token', t);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(t);
    setUser(data.user);
    return data.user;
  };

  const login = useCallback(async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;
      saveAuth({ access_token, user });
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng nhập thất bại';
      return { success: false, message: errorMessage };
    }
  }, []);

  const register = useCallback(async (name, email, password, password_confirmation, role) => {
    try {
      const response = await api.post('/register', { 
        name, 
        email, 
        password, 
        password_confirmation, 
        role 
      });
      const { access_token, user } = response.data;
      saveAuth({ access_token, user });
      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Đăng ký thất bại';
      return { success: false, message: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!token && !!user;
  const isRole = (role) => user?.role === role;

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      register, 
      logout, 
      isAuthenticated, 
      isRole 
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

export function useApi() {
  const { token } = useAuth();

  const headers = () => ({
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  });

  const request = async (method, path, body) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}${path}`, {
        method,
        headers: headers(),
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });

      if (res.status === 204) return { success: true, data: null, message: 'OK' };

      const data = await res.json();

      if (!res.ok) {
        const message =
          Object.values(data?.errors || {})[0]?.[0] ||
          data?.message ||
          `HTTP ${res.status}`;
        return { success: false, data: null, message };
      }

      return { success: true, data, message: 'OK' };
    } catch (err) {
      return { success: false, data: null, message: err.message || 'Network error' };
    }
  };

  return {
    get:    (path)       => request('GET',    path),
    post:   (path, body) => request('POST',   path, body),
    put:    (path, body) => request('PUT',    path, body),
    patch:  (path, body) => request('PATCH',  path, body),
    delete: (path)       => request('DELETE', path),
  };
}
>>>>>>> 52c0e70301f4f8ca44b8b30a5c660b9ec94ac2ff
