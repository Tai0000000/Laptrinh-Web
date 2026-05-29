import React from 'react';

const Login = () => {
  return (
    <section className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/70 bg-white/80 p-10 shadow-2xl backdrop-blur-xl sm:p-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900">Đăng nhập</h1>
        <p className="mt-4 text-slate-600">Chào mừng bạn trở lại với hệ thống quản lý đua ngựa.</p>

        <form className="mt-10 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="example@gmail.com"
              className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Mật khẩu</label>
            <input
              type="password"
              placeholder="••••••••"
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
            className="w-full rounded-full bg-slate-900 px-6 py-4 font-bold text-white shadow-lg transition hover:-translate-y-1 hover:bg-slate-800"
          >
            Đăng nhập
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-600">
          Chưa có tài khoản? <a href="#" className="text-indigo-600 font-black hover:underline">Đăng ký ngay</a>
        </div>
      </div>
    </section>
  );
};

export default Login;
