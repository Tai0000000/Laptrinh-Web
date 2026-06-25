import React, { useState } from 'react';

import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
    const { register, error, setError } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState('spectator');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== passwordConfirmation) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);
        try {
            await register(name, email, password, passwordConfirmation, role);
            navigate('/dashboard');
        } catch (err) {
            console.error('Registration error', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-white/70 bg-white/80 p-8 shadow-glow backdrop-blur-xl sm:p-10">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Create Account</h1>
                <p className="mt-3 text-slate-600">Register and choose a demo role to test role-based features.</p>

                {error && (
                    <div className="mt-6 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-600 border border-rose-100">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Full Name</span>
                        <input
                            type="text"
                            required
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Email Address</span>
                        <input
                            type="email"
                            required
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Demo Role Selection</span>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-slate-400 text-slate-700"
                        >
                            <option value="spectator">Spectator (Khán giả)</option>
                            <option value="horse_owner">Horse Owner (Chủ ngựa)</option>
                            <option value="jockey">Jockey (Nài ngựa)</option>
                            <option value="race_referee">Race Referee (Trọng tài)</option>
                            <option value="admin">System Admin (Quản trị)</option>
                        </select>
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

                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</span>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400 focus:border-slate-400"
                        />
                    </label>

                    <div className="pt-2 flex items-center justify-between">
                        <button
                            type="submit"
                            disabled={loading}
                            className="rounded-full bg-slate-900 px-6 py-3 font-medium text-white shadow-glow transition hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {loading ? 'Creating account...' : 'Register'}
                        </button>
                        <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 underline">
                            Already have an account? Log in
                        </Link>
                    </div>
                </form>
            </div>
        </section>
    );
}

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: 'spectator'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.password_confirmation,
      formData.role
    );

    if (result.success) {
      const role = result.user.role;
      switch (role) {
        case 'horse_owner':
          navigate('/horse-owner/dashboard');
          break;
        case 'referee':
          navigate('/referee/dashboard');
          break;
        case 'jockey':
          navigate('/jockey/dashboard');
          break;
        case 'admin':
          navigate('/admin/dashboard');
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
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Đăng ký</h1>
        <p className="mt-4 text-slate-600">Tạo tài khoản mới để sử dụng hệ thống quản lý đua ngựa.</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Họ và tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nguyễn Văn A"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@gmail.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              required
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
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              <option value="spectator">Khán giả</option>
              <option value="horse_owner">Chủ ngựa</option>
              <option value="jockey">Jockey</option>
              <option value="referee">Trọng tài</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Đã có tài khoản? <Link to="/login" className="text-indigo-600 font-black hover:underline">Đăng nhập ngay</Link>
        </div>
      </div>
    </section>
  );
};


export default Register;
