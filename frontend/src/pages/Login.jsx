import React, { useState } from 'react';

import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/login', { email, password });
      const { access_token, user } = response.data;

      // Lưu token và user vào localStorage
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect theo role
      switch (user.role) {
        case 'referee':
        case 'race_referee':
          navigate('/referee/dashboard');
          break;
        case 'horse_owner':
          navigate('/horse-owner/dashboard');
          break;
        case 'jockey':
          navigate('/dashboard');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      if (err.response?.status === 422) {
        const errors = err.response.data.errors;
        setError(Object.values(errors).flat().join(' '));
      } else {
        setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };


import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user?.role;
      switch (role) {
        case 'horse_owner': navigate('/horse-owner/dashboard'); break;
        case 'referee':
        case 'race_referee': navigate('/referee/dashboard');   break;
        case 'jockey':       navigate('/jockey');              break;
        case 'admin':        navigate('/dashboard');           break;
        default:             navigate('/');                    break;
      }
    } else {
      setError(result.message || 'Đăng nhập thất bại.');
    }
    setLoading(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-10 shadow-2xl backdrop-blur-xl sm:p-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
        <p className="mt-4 text-slate-600">Chào mừng bạn trở lại với hệ thống quản lý đua ngựa.</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input

              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              required

              type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="example@gmail.com" required

              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
            <input

              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required

              type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="••••••••" required

              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-300 text-indigo-600" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-indigo-600 font-bold hover:underline">Quên mật khẩu?</a>
          </div>
          <button

            type="submit"
            disabled={loading}

            type="submit" disabled={loading}

            className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">

          Chưa có tài khoản? <a href="#" className="text-indigo-600 font-black hover:underline">Đăng ký ngay</a>

          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-indigo-600 font-black hover:underline">Đăng ký ngay</Link>
        </div>
      </div>
    </section>
  );
};

export default Login;
