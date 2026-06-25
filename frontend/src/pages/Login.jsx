import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
    const { login, error } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Sign In</h1>
                <p className="mt-3 text-slate-600">Access the Horse Racing Tournament management portal.</p>

                {error && (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Email Address</span>
                        <input
                            type="email"
                            required
                            placeholder="admin@horse.vn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Password</span>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <div className="pt-2 flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-slate-900 px-6 py-3 font-medium text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                        <Link to="/register" className="text-sm font-medium text-slate-600 hover:text-slate-900 underline">
                            Create a new account
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      const role = result.user.role;
      switch (role) {
        case 'horse_owner':
          navigate('/horse-owner/dashboard');
          break;
        case 'referee':
        case 'race_referee':
          navigate('/referee/dashboard');
          break;
        case 'jockey':
          navigate('/jockey/dashboard');
          break;
        case 'admin':
          navigate('/dashboard');
          break;
        case 'spectator':
        default:
          navigate('/');
          break;
      }
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              Ghi nhớ đăng nhập
            </label>
            <a href="#" className="text-indigo-600 font-bold hover:underline">Quên mật khẩu?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Chưa có tài khoản? <Link to="/register" className="text-indigo-600 font-black hover:underline">Đăng ký ngay</Link>
        </div>
      </div>
    </section>
  );
};


export default Login;
