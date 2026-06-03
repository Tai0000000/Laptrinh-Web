import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
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
