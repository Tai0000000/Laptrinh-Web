import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', password_confirmation: '', role: 'spectator',
  });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
      role: formData.role,
    });

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
      setError(result.message || 'Đăng ký thất bại.');
    }
    setLoading(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

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
              type="text" name="name" value={formData.name}
              onChange={handleChange} placeholder="Nguyễn Văn A" required
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email" name="email" value={formData.email}
              onChange={handleChange} placeholder="example@gmail.com" required
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
            <input
              type="password" name="password" value={formData.password}
              onChange={handleChange} placeholder="••••••••" required minLength={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Xác nhận mật khẩu</label>
            <input
              type="password" name="password_confirmation" value={formData.password_confirmation}
              onChange={handleChange} placeholder="••••••••" required minLength={6}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Vai trò</label>
            <select
              name="role" value={formData.role} onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            >
              <option value="spectator">Khán giả</option>
              <option value="horse_owner">Chủ ngựa</option>
              <option value="jockey">Nài ngựa (Jockey)</option>
              <option value="referee">Trọng tài</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-indigo-600 font-black hover:underline">Đăng nhập ngay</Link>
        </div>
      </div>
    </section>
  );
};

export default Register;
